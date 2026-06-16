import { Router } from 'express'
import { RankingController } from '../controllers/RankingController.js'
import { ensureAuthenticated } from '@shared/infra/http/middlewares/ensureAuthenticated.js'

const rankingRouter = Router()
const rankingController = new RankingController()

rankingRouter.get('/api/ranking', (req, res, next) => {
  ensureAuthenticated(req, res, next).catch(next)
}, (req, res, next) => {
  rankingController.index(req, res).catch(next)
})

rankingRouter.post('/api/ranking/recalculate', (req, res, next) => {
  rankingController.recalculate(req, res).catch(next)
})

export { rankingRouter }
