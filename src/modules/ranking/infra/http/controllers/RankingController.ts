import { Request, Response } from 'express'
import { GetRankingService } from '@modules/ranking/services/GetRankingService.js'

export class RankingController {
  async index(req: Request, res: Response): Promise<Response> {
    const getRanking = new GetRankingService()
    const ranking = await getRanking.execute()
    return res.json(ranking)
  }
}
