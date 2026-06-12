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

  // Placar exato = 5 pontos
  if (guess.homeScore === match.homeScore && guess.awayScore === match.awayScore) {
    return 5
  }

  const guessDiff = guess.homeScore - guess.awayScore
  const matchDiff = match.homeScore - match.awayScore

  // Determina vencedor
  const guessWinner = guessDiff > 0 ? 'home' : guessDiff < 0 ? 'away' : 'draw'
  const matchWinner = matchDiff > 0 ? 'home' : matchDiff < 0 ? 'away' : 'draw'

  if (guessWinner === matchWinner) {
    // Acertou vencedor + saldo de gols = 3 pontos
    if (guessDiff === matchDiff) {
      return 3
    }
    // Acertou empate mas com gols errados = 2 pontos
    if (matchWinner === 'draw') {
      return 2
    }
    // Só acertou o vencedor = 1 ponto
    return 1
  }

  return 0
}
