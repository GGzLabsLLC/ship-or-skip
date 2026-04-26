const admin = require("firebase-admin");

admin.initializeApp();

const { submitVote } = require("./submitVote.cjs");

exports.submitVote = submitVote;