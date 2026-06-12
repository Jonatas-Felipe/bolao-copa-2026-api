import { Router } from 'express'
import { MatchesController } from '../controllers/MatchesController.js'
import { ensureAuthenticated } from '@shared/infra/http/middlewares/ensureAuthenticated.js'

const matchesRouter = Router()
const matchesController = new MatchesController()

matchesRouter.get('/api/matches', (req, res, next) => {
  ensureAuthenticated(req, res, next).catch(next)
}, (req, res, next) => {
  matchesController.index(req, res).catch(next)
})

matchesRouter.get('/api/matches/sync', (req, res, next) => {
  matchesController.sync(req, res).catch(next)
})

matchesRouter.get('/api/teams', (req, res, next) => {
  matchesController.teams(req, res).catch(next)
})

matchesRouter.get('/api/groups', (req, res, next) => {
  matchesController.groups(req, res).catch(next)
})

export { matchesRouter }
