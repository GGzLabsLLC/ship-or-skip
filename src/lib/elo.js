export function calculateElo(winnerRating, loserRating, k = 32) {
  const expectedWinner =
    1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));

  const expectedLoser =
    1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

  const newWinnerRating = winnerRating + k * (1 - expectedWinner);
  const newLoserRating = loserRating + k * (0 - expectedLoser);

  return {
    winner: Math.round(newWinnerRating),
    loser: Math.round(newLoserRating),
  };
}