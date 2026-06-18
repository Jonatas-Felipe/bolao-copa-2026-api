import { AppDataSource } from '@shared/infra/typeorm/data-source.js'
import { User } from '@modules/users/infra/typeorm/entities/User.js'
import { Guess } from '@modules/guesses/infra/typeorm/entities/Guess.js'
import { Match } from '@modules/matches/infra/typeorm/entities/Match.js'
import { calculatePoints } from './CalculatePointsService.js'

export class RecalculateAllPointsService {
  async execute(): Promise<number> {
    const userRepo = AppDataSource.getRepository(User)
    const guessRepo = AppDataSource.getRepository(Guess)
    const matchRepo = AppDataSource.getRepository(Match)

    const finishedMatches = await matchRepo.find({ where: { finished: true } })
    // Também incluir jogos com placar preenchido que por algum motivo não foram marcados como finished
    const matchesWithScores = await matchRepo
      .createQueryBuilder('m')
      .where('m.homeScore IS NOT NULL AND m.awayScore IS NOT NULL')
      .getMany()
    const allScoredMatches = [...finishedMatches, ...matchesWithScores]
    const matchesMap = new Map(allScoredMatches.map((m) => [m.id, m]))

    const users = await userRepo.find({ select: ['id'] })
    const allGuesses = await guessRepo.find()

    let updatedCount = 0

    for (const user of users) {
      const userGuesses = allGuesses.filter((g) => g.userId === user.id)
      let points = 0

      for (const guess of userGuesses) {
        const match = matchesMap.get(guess.matchId)
        if (!match || match.homeScore === null || match.awayScore === null) continue

        const homeScore = Number(match.homeScore)
        const awayScore = Number(match.awayScore)
        if (isNaN(homeScore) || isNaN(awayScore)) continue

        points += calculatePoints(
          { homeScore: guess.homeScore, awayScore: guess.awayScore },
          { homeScore, awayScore },
        )
      }

      await userRepo.update(user.id, { points })
      updatedCount++
    }

    return updatedCount
  }
}
