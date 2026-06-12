import { Request, Response } from 'express'
import { RegisterUserService } from '@modules/users/services/RegisterUserService.js'
import { LoginUserService } from '@modules/users/services/LoginUserService.js'
import { RevokeTokenService } from '@modules/tokens/services/RevokeTokenService.js'

export class AuthController {
  async register(req: Request, res: Response): Promise<Response> {
    const { name, pin } = req.body

    const registerUser = new RegisterUserService()
    const user = await registerUser.execute({ name, pin })

    return res.status(201).json(user)
  }

  async login(req: Request, res: Response): Promise<Response> {
    const { name, pin } = req.body

    const loginUser = new LoginUserService()
    const result = await loginUser.execute({ name, pin })

    return res.json(result)
  }

  async logout(req: Request, res: Response): Promise<Response> {
    const authHeader = req.headers.authorization
    const [, token] = (authHeader || '').split(' ')

    const revokeToken = new RevokeTokenService()
    await revokeToken.execute(token)

    return res.json({ message: 'Logout realizado com sucesso' })
  }
}
