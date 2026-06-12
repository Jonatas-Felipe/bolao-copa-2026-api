import { AppDataSource } from '@shared/infra/typeorm/data-source.js'
import { Match } from '@modules/matches/infra/typeorm/entities/Match.js'

interface ListMatchesOptions {
  page?: number
  limit?: number
  type?: string
  group?: string
  finished?: boolean
}

interface PaginatedResult {
  matches: Match[]
  total: number
  page: number
  totalPages: number
}

export class ListMatchesService {
  async execute(options: ListMatchesOptions = {}): Promise<PaginatedResult> {
    const { page = 1, limit = 20, type, group, finished } = options
    const matchRepo = AppDataSource.getRepository(Match)

    const qb = matchRepo.createQueryBuilder('match')

    if (type) {
      qb.andWhere('match.type = :type', { type })
    }
    if (group) {
      qb.andWhere('match.group = :group', { group })
    }
    if (finished !== undefined) {
      qb.andWhere('match.finished = :finished', { finished })
    }

    qb.orderBy('match.date', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)

    const [matches, total] = await qb.getManyAndCount()

    return {
      matches,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }
}
