import { AppDataSource } from '@shared/infra/typeorm/data-source.js'
import { Token } from '@modules/tokens/infra/typeorm/entities/Token.js'
import { AppError } from '@shared/errors/AppError.js'

export class RevokeTokenService {
  async execute(token: string): Promise<void> {
    const tokenRepo = AppDataSource.getRepository(Token)

    const storedToken = await tokenRepo.findOneBy({ token })
    if (!storedToken) {
      throw new AppError('Token não encontrado', 404)
    }

    storedToken.revoked = true
    await tokenRepo.save(storedToken)
  }
}
