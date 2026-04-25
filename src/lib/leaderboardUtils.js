import { ALL_CATEGORY_ID, getProjectCategoryId } from "../constants/categories";

export function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

export function getShipRate(project) {
  const wins = project?.wins || 0;
  const losses = project?.losses || 0;
  const totalDecisions = wins + losses;

  if (!totalDecisions) return 0;
  return Math.round((wins / totalDecisions) * 100);
}

export function formatDisplayUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return String(value)
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "");
  }
}

export function getApprovedProjects(projects) {
  return (projects || []).filter(
    (project) => normalizeStatus(project?.status) === "approved"
  );
}

export function getEligibleProjects(projects, selectedCategoryId) {
  const approvedProjects = getApprovedProjects(projects);
  if (selectedCategoryId === ALL_CATEGORY_ID) return approvedProjects;

  return approvedProjects.filter(
    (project) => getProjectCategoryId(project?.category) === selectedCategoryId
  );
}

export function getRankedProjects(projects) {
  return [...(projects || [])].sort(
    (a, b) => (Number(b?.rating) || 0) - (Number(a?.rating) || 0)
  );
}

export function getRankByProjectId(rankedProjects) {
  const map = new Map();

  for (let index = 0; index < (rankedProjects || []).length; index += 1) {
    const project = rankedProjects[index];
    if (!project?.id) continue;
    map.set(project.id, index + 1);
  }

  return map;
}

