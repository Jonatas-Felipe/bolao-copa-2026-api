import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Raw } from "typeorm";

import { AppDataSource } from '@shared/infra/typeorm/data-source.js'
import { User } from '@modules/users/infra/typeorm/entities/User.js'
import { Token } from '@modules/tokens/infra/typeorm/entities/Token.js'
import { authConfig } from '@config/auth.js'
import { AppError } from '@shared/errors/AppError.js'

interface Request {
  name: string
  pin: string
}

interface Response {
  user: { id: string; name: string; points: number }
  token: string
}

export class LoginUserService {
  async execute({ name, pin }: Request): Promise<Response> {
    const userRepo = AppDataSource.getRepository(User)
    const tokenRepo = AppDataSource.getRepository(Token)

    const user = await userRepo.findOneBy({ name: Raw((alias) => `LOWER(${alias}) = LOWER(:value)`, { value: name }) })
    if (!user) {
      throw new AppError('Credenciais inválidas', 401)
    }

    const pinMatches = await bcrypt.compare(pin, user.pin)
    if (!pinMatches) {
      throw new AppError('Credenciais inválidas', 401)
    }

    const token = jwt.sign({}, authConfig.jwt.secret, {
      subject: user.id,
      expiresIn: authConfig.jwt.expiresIn as any,
    })

    // Salva o token no banco
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 180) // 6 meses

    await tokenRepo.save(
      tokenRepo.create({
        token,
        userId: user.id,
        expiresAt,
      }),
    )

    return {
      user: { id: user.id, name: user.name, points: user.points },
      token,
    }
  }
}
