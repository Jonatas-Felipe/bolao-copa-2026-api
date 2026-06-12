import { Router } from 'express'
import { authRouter } from '@modules/users/infra/http/routes/auth.routes.js'
import { matchesRouter } from '@modules/matches/infra/http/routes/matches.routes.js'
import { guessesRouter } from '@modules/guesses/infra/http/routes/guesses.routes.js'
import { rankingRouter } from '@modules/ranking/infra/http/routes/ranking.routes.js'

const router = Router()

router.use(authRouter)
router.use(matchesRouter)
router.use(guessesRouter)
router.use(rankingRouter)

export { router }
