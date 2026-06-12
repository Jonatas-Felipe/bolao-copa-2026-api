import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { authConfig } from '@config/auth.js'
import { AppError } from '@shared/errors/AppError.js'
import { AppDataSource } from '@shared/infra/typeorm/data-source.js'
import { Token } from '@modules/tokens/infra/typeorm/entities/Token.js'

interface TokenPayload {
  sub: string
  iat: number
  exp: number
}

export async function ensureAuthenticated(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    throw new AppError('Token não fornecido', 401)
  }

  const [, token] = authHeader.split(' ')

  try {
    const decoded = jwt.verify(token, authConfig.jwt.secret) as TokenPayload

    // Verifica se o token existe no banco e não foi revogado
    const tokenRepo = AppDataSource.getRepository(Token)
    const storedToken = await tokenRepo.findOneBy({ token, revoked: false })

    if (!storedToken) {
      throw new AppError('Token revogado ou inválido', 401)
    }

    req.user = { id: decoded.sub }
    next()
  } catch (err) {
    if (err instanceof AppError) throw err
    throw new AppError('Token inválido', 401)
  }
}
