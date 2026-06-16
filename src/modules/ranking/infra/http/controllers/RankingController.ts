import { Request, Response } from 'express'
import { GetRankingService } from '@modules/ranking/services/GetRankingService.js'
import { RecalculateAllPointsService } from '@modules/ranking/services/RecalculateAllPointsService.js'

export class RankingController {
  async index(req: Request, res: Response): Promise<Response> {
    const getRanking = new GetRankingService()
    const ranking = await getRanking.execute()
    return res.json(ranking)
  }

  async recalculate(req: Request, res: Response): Promise<Response> {
    const recalcService = new RecalculateAllPointsService()
    const count = await recalcService.execute()
    return res.json({ recalculated: count })
  }
}
