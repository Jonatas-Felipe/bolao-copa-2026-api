import { AppDataSource } from '@shared/infra/typeorm/data-source.js'
import { Guess } from '@modules/guesses/infra/typeorm/entities/Guess.js'

export class ListUserGuessesService {
  async execute(userId: string): Promise<Guess[]> {
    const guessRepo = AppDataSource.getRepository(Guess)
    return guessRepo.find({
      where: { userId },
      order: { matchId: 'ASC' },
    })
  }
}
