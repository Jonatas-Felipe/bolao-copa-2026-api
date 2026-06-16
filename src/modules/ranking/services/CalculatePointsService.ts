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

  // 7 pontos: Placar exato (ex: apostou 2x1 e deu 2x1)
  if (guess.homeScore === match.homeScore && guess.awayScore === match.awayScore) {
    return 7
  }

  const guessDiff = guess.homeScore - guess.awayScore
  const matchDiff = match.homeScore - match.awayScore

  // Determina vencedor
  const guessWinner = guessDiff > 0 ? 'home' : guessDiff < 0 ? 'away' : 'draw'
  const matchWinner = matchDiff > 0 ? 'home' : matchDiff < 0 ? 'away' : 'draw'

  if (guessWinner === matchWinner) {
    // 3 pontos: Acertou o empate com saldo errado (ex: apostou 1x1, deu 2x2)
    if (matchWinner === 'draw') {
      return 3
    }
    // 5 pontos: Acertou o vencedor e o saldo de gols (ex: apostou 2x1, deu 3x2)
    if (guessDiff === matchDiff) {
      return 5
    }
    // 4 pontos: Acertou o placar do vencedor (ex: apostou 2x1, deu 2x0)
    const winnerScoreGuess = matchWinner === 'home' ? guess.homeScore : guess.awayScore
    const winnerScoreMatch = matchWinner === 'home' ? match.homeScore : match.awayScore
    if (winnerScoreGuess === winnerScoreMatch) {
      return 4
    }
    // 2 pontos: Acertou o placar do perdedor (ex: apostou 2x1, deu 3x1)
    const loserScoreMatch = matchWinner === 'home' ? match.awayScore : match.homeScore
    const loserScoreGuess = matchWinner === 'home' ? guess.awayScore : guess.homeScore
    if (loserScoreGuess === loserScoreMatch) {
      return 2
    }
    // 1 ponto: Acertou apenas quem venceu a partida
    return 1
  }

  return 0
}
