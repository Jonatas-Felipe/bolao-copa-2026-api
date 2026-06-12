import { Router } from 'express'
import { AuthController } from '../controllers/AuthController.js'
import { ensureAuthenticated } from '@shared/infra/http/middlewares/ensureAuthenticated.js'

const authRouter = Router()
const authController = new AuthController()

authRouter.post('/api/auth/register', (req, res, next) => {
  authController.register(req, res).catch(next)
})

authRouter.post('/api/auth/login', (req, res, next) => {
  authController.login(req, res).catch(next)
})

authRouter.post('/api/auth/logout', ensureAuthenticated, (req, res, next) => {
  authController.logout(req, res).catch(next)
})

export { authRouter }
