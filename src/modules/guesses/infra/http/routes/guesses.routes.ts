import { Router } from 'express'
import { GuessesController } from '../controllers/GuessesController.js'
import { ensureAuthenticated } from '@shared/infra/http/middlewares/ensureAuthenticated.js'

const guessesRouter = Router()
const guessesController = new GuessesController()

guessesRouter.post('/api/guesses', (req, res, next) => {
  ensureAuthenticated(req, res, next).catch(next)
}, (req, res, next) => {
  guessesController.create(req, res).catch(next)
})

guessesRouter.get('/api/guesses/me', (req, res, next) => {
  ensureAuthenticated(req, res, next).catch(next)
}, (req, res, next) => {
  guessesController.me(req, res).catch(next)
})

guessesRouter.get('/api/guesses/match/:matchId', (req, res, next) => {
  ensureAuthenticated(req, res, next).catch(next)
}, (req, res, next) => {
  guessesController.listByMatch(req, res).catch(next)
})

export { guessesRouter }
