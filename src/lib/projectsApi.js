import {
  collection,
  addDoc,
  getDocs,
  doc,
  serverTimestamp,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "./firebase";
import { optimizeScreenshotForUpload } from "./imageOptimize";
import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";
import { normalizeAiDisclosure } from "../constants/aiDisclosure";


const PROJECTS_COLLECTION = "projects";
const PROJECT_SCREENSHOTS_PREFIX = "project-screenshots";
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SCREENSHOT_SIZE_BYTES = 3 * 1024 * 1024;
const MAX_NAME_LENGTH = 80;
const MAX_TAGLINE_LENGTH = 160;
const MAX_WHY_BUILT_LENGTH = 200;
const MAX_CATEGORY_LENGTH = 40;
const MAX_URL_LENGTH = 2048;

function getSafeHttpUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(String(value).trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

function getRandomSuffix() {
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    return Math.random().toString(16).slice(2, 10);
  }

  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function validateProjectSubmission(project) {
  const name = String(project?.name || "").trim();
  const tagline = String(project?.tagline || "").trim();
  const whyBuilt = String(project?.whyBuilt || "").trim();
  const category = String(project?.category || "").trim();
  const link = getSafeHttpUrl(project?.link || "");
  const aiDisclosure = normalizeAiDisclosure(project?.aiDisclosure);
  const screenshotFile = project?.screenshotFile || null;

  if (!name) throw new Error("Project name is required.");
  if (name.length > MAX_NAME_LENGTH) {
    throw new Error(`Project name must be ${MAX_NAME_LENGTH} characters or fewer.`);
  }

  if (!tagline) throw new Error("Tagline is required.");
  if (tagline.length > MAX_TAGLINE_LENGTH) {
    throw new Error(`Tagline must be ${MAX_TAGLINE_LENGTH} characters or fewer.`);
  }

  if (whyBuilt.length > MAX_WHY_BUILT_LENGTH) {
    throw new Error(`Why I built this must be ${MAX_WHY_BUILT_LENGTH} characters or fewer.`);
  }

  if (!category) throw new Error("Category is required.");
  if (category.length > MAX_CATEGORY_LENGTH) {
    throw new Error(`Category must be ${MAX_CATEGORY_LENGTH} characters or fewer.`);
  }

  if (!link) throw new Error("Project URL must start with http:// or https://");
  if (link.length > MAX_URL_LENGTH) {
    throw new Error("Project URL is too long.");
  }

  if (!screenshotFile) throw new Error("Homepage screenshot is required.");
  if (!ACCEPTED_IMAGE_TYPES.includes(screenshotFile.type)) {
    throw new Error("Screenshot must be a PNG, JPG, or WEBP image.");
  }
  if (screenshotFile.size >= MAX_SCREENSHOT_SIZE_BYTES) {
    throw new Error("Screenshot must be smaller than 3MB.");
  }

  return { name, tagline, whyBuilt, category, link, aiDisclosure, screenshotFile };
}

async function uploadProjectScreenshot(file) {
  if (!file) {
    throw new Error("Homepage screenshot is required.");
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Screenshot must be a PNG, JPG, or WEBP image.");
  }

  if (file.size >= MAX_SCREENSHOT_SIZE_BYTES) {
    throw new Error("Screenshot must be smaller than 3MB.");
  }

  let uploadFile = file;
  let contentType = file.type || "";

  try {
    const optimized = await optimizeScreenshotForUpload(file, {
      maxWidth: 1000,
      quality: 0.82,
      maxBytes: MAX_SCREENSHOT_SIZE_BYTES - 1024,
    });

    if (optimized?.file && optimized?.didOptimize) {
      uploadFile = optimized.file;
      contentType = optimized.contentType || "image/webp";
    }
  } catch {
    // Optimization is best-effort; fall back to the original validated file.
  }

  const safeName = uploadFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const trimmedName = safeName.slice(0, 120) || "screenshot.webp";
  const filePath = `${PROJECT_SCREENSHOTS_PREFIX}/${Date.now()}-${getRandomSuffix()}-${trimmedName}`;
  const storageRef = ref(storage, filePath);

  await uploadBytes(storageRef, uploadFile, {
    contentType: contentType || uploadFile.type || "application/octet-stream",
  });
  const downloadUrl = await getDownloadURL(storageRef);

  return downloadUrl;
}

export async function fetchApprovedProjects() {
  const projectsQuery = query(
    collection(db, PROJECTS_COLLECTION),
    where("status", "==", "approved")
  );

  const snapshot = await getDocs(projectsQuery);

  return snapshot.docs.map((projectDoc) => ({
    id: projectDoc.id,
    ...projectDoc.data(),
  }));
}

export async function fetchAllProjectsForAdmin() {
  const snapshot = await getDocs(collection(db, PROJECTS_COLLECTION));

  return snapshot.docs.map((projectDoc) => ({
    id: projectDoc.id,
    ...projectDoc.data(),
  }));
}

// Submit new project
export async function createProject(project) {
  const validated = validateProjectSubmission(project);
  const screenshotUrl = await uploadProjectScreenshot(validated.screenshotFile);

  const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
    name: validated.name,
    tagline: validated.tagline,
    link: validated.link,
    imageUrl: screenshotUrl,
    screenshotUrl,
    category: validated.category,
    aiDisclosure: validated.aiDisclosure,
    whyBuilt: validated.whyBuilt,

    rating: 1200,
    wins: 0,
    losses: 0,
    votes: 0,

    status: "pending",
    submittedAt: serverTimestamp(),
    statusUpdatedAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    name: validated.name,
    tagline: validated.tagline,
    link: validated.link,
    imageUrl: screenshotUrl,
    screenshotUrl,
    category: validated.category,
    aiDisclosure: validated.aiDisclosure,
    whyBuilt: validated.whyBuilt,
    rating: 1200,
    wins: 0,
    losses: 0,
    votes: 0,
    status: "pending",
  };
}

function getEloWinProbability(ratingA, ratingB) {
  const exponent = (ratingB - ratingA) / 400;
  return 1 / (1 + 10 ** exponent);
}

function _calculateEloRatings(winnerRating, loserRating) {
  const kFactor = 32;
  const expectedWinner = getEloWinProbability(winnerRating, loserRating);
  const expectedLoser = 1 - expectedWinner;

  return {
    winner: Math.round(winnerRating + kFactor * (1 - expectedWinner)),
    loser: Math.round(loserRating + kFactor * (0 - expectedLoser)),
  };
}

// Soft-launch only: client-side voting is still abusable (spam/bots).
// Replace with a callable Cloud Function that validates + rate limits + updates atomically.
export async function updateVote(winnerId, loserId) {
  if (!winnerId || !loserId || winnerId === loserId) {
    throw new Error("Invalid vote payload.");
  }

  const submitVote = httpsCallable(functions, "submitVote");

  await submitVote({
    winnerId,
    loserId,
  });
}

// Approve project
export async function approveProject(projectId) {
  const projectRef = doc(db, PROJECTS_COLLECTION, projectId);

  await updateDoc(projectRef, {
    status: "approved",
    statusUpdatedAt: serverTimestamp(),
  });
}

// Reject project
export async function rejectProject(projectId) {
  const projectRef = doc(db, PROJECTS_COLLECTION, projectId);

  await updateDoc(projectRef, {
    status: "rejected",
    statusUpdatedAt: serverTimestamp(),
  });
}

// Restore project to pending
export async function restoreProjectToPending(projectId) {
  const projectRef = doc(db, PROJECTS_COLLECTION, projectId);

  await updateDoc(projectRef, {
    status: "pending",
    statusUpdatedAt: serverTimestamp(),
  });
}


