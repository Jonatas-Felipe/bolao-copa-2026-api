interface GuessScore {
  homeScore: number
  awayScore: number
}

interface MatchScore {
  homeScore: number | null
  awayScore: number | null
}

export function calculatePoints(guess: GuessScore, match: MatchScore): number {
  if (match.homeScore === null || match.awayScore === null) return 0

  // 25 pontos: Placar exato (ex: apostou 2x1 e deu 2x1)
  if (guess.homeScore === match.homeScore && guess.awayScore === match.awayScore) {
    return 25
  }

  const guessDiff = guess.homeScore - guess.awayScore
  const matchDiff = match.homeScore - match.awayScore

  // Determina vencedor
  const guessWinner = guessDiff > 0 ? 'home' : guessDiff < 0 ? 'away' : 'draw'
  const matchWinner = matchDiff > 0 ? 'home' : matchDiff < 0 ? 'away' : 'draw'

  if (guessWinner === matchWinner) {
    // 11 pontos: Acertou o empate com saldo errado (ex: apostou 1x1, deu 2x2)
    if (matchWinner === 'draw') {
      return 11
    }
    // 18 pontos: Acertou o placar do vencedor (ex: apostou 2x1, deu 2x0)
    const winnerScoreGuess = matchWinner === 'home' ? guess.homeScore : guess.awayScore
    const winnerScoreMatch = matchWinner === 'home' ? match.homeScore : match.awayScore
    if (winnerScoreGuess === winnerScoreMatch) {
      return 18
    }
    // 15 pontos: Acertou o vencedor e o saldo de gols (ex: apostou 2x1, deu 3x2)
    if (guessDiff === matchDiff) {
      return 15
    }
    // 12 pontos: Acertou o placar do perdedor (ex: apostou 2x1, deu 3x1)
    const loserScoreMatch = matchWinner === 'home' ? match.awayScore : match.homeScore
    const loserScoreGuess = matchWinner === 'home' ? guess.awayScore : guess.homeScore
    if (loserScoreGuess === loserScoreMatch) {
      return 12
    }
    // 10 pontos: Acertou apenas quem venceu a partida
    return 10
  }

  // 4 pontos: Colocou empate no palpite
  if (guessWinner === 'draw') {
    return 4
  }

  return 0
}
