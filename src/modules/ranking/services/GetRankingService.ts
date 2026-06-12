import { AppDataSource } from '@shared/infra/typeorm/data-source.js'
import { User } from '@modules/users/infra/typeorm/entities/User.js'

interface RankingEntry {
  id: string
  name: string
  points: number
}

export class GetRankingService {
  async execute(): Promise<RankingEntry[]> {
    const userRepo = AppDataSource.getRepository(User)

    const users = await userRepo.find({
      select: ['id', 'name', 'points'],
      order: { points: 'DESC' },
    })

    return users
  }
}
