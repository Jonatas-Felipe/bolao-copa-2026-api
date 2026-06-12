import { AppDataSource } from '@shared/infra/typeorm/data-source.js'
import { Guess } from '@modules/guesses/infra/typeorm/entities/Guess.js'
import { Match } from '@modules/matches/infra/typeorm/entities/Match.js'
import { AppError } from '@shared/errors/AppError.js'

interface Request {
  userId: string
  matchId: string
  homeScore: number
  awayScore: number
}

export class CreateGuessService {
  async execute({ userId, matchId, homeScore, awayScore }: Request): Promise<Guess> {
    const guessRepo = AppDataSource.getRepository(Guess)
    const matchRepo = AppDataSource.getRepository(Match)

    const match = await matchRepo.findOneBy({ id: matchId })
    if (!match) {
      throw new AppError('Jogo não encontrado', 404)
    }

    if (match.finished) {
      throw new AppError('Este jogo já foi finalizado.', 403)
    }

    // Regra: o jogo deve estar no mínimo 30 minutos no futuro
    const now = new Date()
    const thirtyMinFromNow = new Date(now.getTime() + 30 * 60 * 1000)
    if (match.date <= thirtyMinFromNow) {
      throw new AppError('Tempo esgotado. Palpites devem ser feitos com no mínimo 30 minutos de antecedência.', 403)
    }

    // Verifica se já existe palpite deste usuário para este jogo
    const existingGuess = await guessRepo.findOneBy({ userId, matchId })
    if (existingGuess) {
      existingGuess.homeScore = homeScore
      existingGuess.awayScore = awayScore
      await guessRepo.save(existingGuess)
      return existingGuess
    }

    const guess = guessRepo.create({
      userId,
      matchId,
      homeScore,
      awayScore,
    })

    await guessRepo.save(guess)
    return guess
  }
}
