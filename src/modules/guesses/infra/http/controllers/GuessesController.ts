import { Request, Response } from 'express'
import { CreateGuessService } from '@modules/guesses/services/CreateGuessService.js'
import { ListUserGuessesService } from '@modules/guesses/services/ListUserGuessesService.js'

export class GuessesController {
  async create(req: Request, res: Response): Promise<Response> {
    const { matchId, homeScore, awayScore } = req.body
    const userId = req.user.id

    const createGuess = new CreateGuessService()
    const guess = await createGuess.execute({ userId, matchId, homeScore, awayScore })

    return res.status(201).json(guess)
  }

  async me(req: Request, res: Response): Promise<Response> {
    const userId = req.user.id

    const listGuesses = new ListUserGuessesService()
    const guesses = await listGuesses.execute(userId)

    return res.json(guesses)
  }
}
