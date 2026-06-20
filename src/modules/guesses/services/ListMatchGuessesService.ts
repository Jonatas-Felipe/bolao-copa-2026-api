import { AppDataSource } from '@shared/infra/typeorm/data-source.js'
import { Guess } from '@modules/guesses/infra/typeorm/entities/Guess.js'
import { Match } from '@modules/matches/infra/typeorm/entities/Match.js'
import { User } from '@modules/users/infra/typeorm/entities/User.js'
import { calculatePoints } from '@modules/ranking/services/CalculatePointsService.js'
import { AppError } from '@shared/errors/AppError.js'

interface GuessWithUserAndPoints {
  id: string
  userName: string
  homeScore: number
  awayScore: number
  points: number
}

export class ListMatchGuessesService {
  async execute(matchId: string): Promise<GuessWithUserAndPoints[]> {
    const matchRepo = AppDataSource.getRepository(Match)
    const guessRepo = AppDataSource.getRepository(Guess)
    const userRepo = AppDataSource.getRepository(User)

    const match = await matchRepo.findOneBy({ id: matchId })
    if (!match) {
      throw new AppError('Jogo não encontrado', 404)
    }

    // Só exibe palpites se o jogo já começou ou finalizou
    const now = new Date()
    if (match.timeElapsed === 'notstarted' && match.date > now) {
      throw new AppError('Os palpites só ficam visíveis após o início do jogo', 403)
    }

    const guesses = await guessRepo.find({ where: { matchId } })
    const users = await userRepo.find({ select: ['id', 'name'] })
    const usersMap = new Map(users.map((u) => [u.id, u.name]))

    const result: GuessWithUserAndPoints[] = guesses
      .map((guess) => {
        let points = 0
        if (match.finished && match.homeScore !== null && match.awayScore !== null) {
          const basePoints = calculatePoints(
            { homeScore: guess.homeScore, awayScore: guess.awayScore },
            { homeScore: Number(match.homeScore), awayScore: Number(match.awayScore) },
          )
          points = basePoints * (match.weight || 10)
        }

        return {
          id: guess.id,
          userName: usersMap.get(guess.userId) || 'Desconhecido',
          homeScore: guess.homeScore,
          awayScore: guess.awayScore,
          points,
        }
      })

    return result.sort((a, b) => b.points - a.points)
  }
}
