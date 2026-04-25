const admin = require("firebase-admin");
const path = require("node:path");
const fs = require("node:fs");

function loadServiceAccount() {
  const serviceAccountPath =
    process.env.SERVICE_ACCOUNT_KEY_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    "";

  if (!serviceAccountPath) {
    throw new Error(
      "Missing service account key path. Set SERVICE_ACCOUNT_KEY_PATH or GOOGLE_APPLICATION_CREDENTIALS to your Admin SDK JSON file."
    );
  }

  const resolved = path.resolve(serviceAccountPath);
  return JSON.parse(fs.readFileSync(resolved, "utf8"));
}

// Paste your Firebase Authentication User UID here.
// This is NOT your private key.
const UID = "ATcWWz2adfVxbIrVmev0hKWkbmB2";

admin.initializeApp({
  credential: admin.credential.cert(loadServiceAccount()),
});

async function main() {
  if (!UID || UID === "PASTE_YOUR_FIREBASE_AUTH_USER_UID_HERE") {
    throw new Error("Paste your Firebase Auth User UID into the UID constant first.");
  }

  await admin.auth().setCustomUserClaims(UID, { admin: true });

  const user = await admin.auth().getUser(UID);
  console.log("Admin claim set for:", user.email);
  console.log("Custom claims:", user.customClaims);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
