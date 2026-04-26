const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const db = getFirestore();

const RATE_LIMIT_WINDOW_MS = 10 * 1000;
const RATE_LIMIT_MAX_VOTES = 5;

function getEloWinProbability(ratingA, ratingB) {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}

function calculateEloRatings(winnerRating, loserRating) {
  const kFactor = 32;
  const expectedWinner = getEloWinProbability(winnerRating, loserRating);
  const expectedLoser = 1 - expectedWinner;

  return {
    winner: Math.round(winnerRating + kFactor * (1 - expectedWinner)),
    loser: Math.round(loserRating + kFactor * (0 - expectedLoser)),
  };
}

const submitVote = onCall(
  {
    region: "us-central1",
    cors: [
      "http://localhost:4173",
      "http://localhost:4174",
      "http://localhost:5173",
      "https://shiporskip-app.web.app",
      "https://shiporskip-app.firebaseapp.com",
      "https://shipitorskip.com",
    ],
  },
  async (request) => {
    const { winnerId, loserId } = request.data || {};

    if (!winnerId || !loserId || winnerId === loserId) {
      throw new HttpsError("invalid-argument", "Invalid vote payload.");
    }

    const ip =
      request.rawRequest.headers["x-forwarded-for"] ||
      request.rawRequest.ip ||
      "unknown";

    const safeIp = String(ip).replace(/[/.#[\]]/g, "_");
    const now = Date.now();

    const voteKey = `${safeIp}_${now}_${Math.random()
      .toString(36)
      .slice(2, 10)}`;

    const voteRef = db.collection("votes").doc(voteKey);
    const rateRef = db.collection("voteRateLimits").doc(safeIp);
    const winnerRef = db.collection("projects").doc(winnerId);
    const loserRef = db.collection("projects").doc(loserId);

    await db.runTransaction(async (transaction) => {
      const rateSnap = await transaction.get(rateRef);

      const rateData = rateSnap.exists ? rateSnap.data() : {};
      const windowStartMs = Number(rateData?.windowStartMs || 0);
      const count = Number(rateData?.count || 0);
      const isSameWindow = now - windowStartMs < RATE_LIMIT_WINDOW_MS;

      if (isSameWindow && count >= RATE_LIMIT_MAX_VOTES) {
        throw new HttpsError(
          "resource-exhausted",
          "Too many votes. Slow down."
        );
      }

      const winnerSnap = await transaction.get(winnerRef);
      const loserSnap = await transaction.get(loserRef);

      if (!winnerSnap.exists || !loserSnap.exists) {
        throw new HttpsError("not-found", "Project not found.");
      }

      const winnerData = winnerSnap.data();
      const loserData = loserSnap.data();

      if (String(winnerData?.status || "").toLowerCase() !== "approved") {
        throw new HttpsError("failed-precondition", "Winner not eligible.");
      }

      if (String(loserData?.status || "").toLowerCase() !== "approved") {
        throw new HttpsError("failed-precondition", "Loser not eligible.");
      }

      const updatedRatings = calculateEloRatings(
        Number(winnerData.rating || 1200),
        Number(loserData.rating || 1200)
      );

      transaction.set(rateRef, {
        ip,
        windowStartMs: isSameWindow ? windowStartMs : now,
        count: isSameWindow ? count + 1 : 1,
        updatedAt: FieldValue.serverTimestamp(),
      });

      transaction.set(voteRef, {
        winnerId,
        loserId,
        ip,
        createdAt: FieldValue.serverTimestamp(),
        createdAtMs: now,
      });

      transaction.update(winnerRef, {
        rating: updatedRatings.winner,
        wins: Number(winnerData.wins || 0) + 1,
        votes: Number(winnerData.votes || 0) + 1,
      });

      transaction.update(loserRef, {
        rating: updatedRatings.loser,
        losses: Number(loserData.losses || 0) + 1,
      });
    });

    return { success: true };
  }
);

module.exports = { submitVote };