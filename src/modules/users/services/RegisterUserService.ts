import bcrypt from 'bcryptjs'
import { AppDataSource } from '@shared/infra/typeorm/data-source.js'
import { User } from '@modules/users/infra/typeorm/entities/User.js'
import { AppError } from '@shared/errors/AppError.js'

interface Request {
  name: string
  pin: string
}

export class RegisterUserService {
  async execute({ name, pin }: Request): Promise<Omit<User, 'pin'>> {
    const userRepo = AppDataSource.getRepository(User)

    const existingUser = await userRepo.findOneBy({ name })
    if (existingUser) {
      throw new AppError('Nome de usuário já existe', 409)
    }

    if (!pin || pin.length < 4) {
      throw new AppError('PIN deve ter no mínimo 4 caracteres')
    }

    const hashedPin = await bcrypt.hash(pin, 10)

    const user = userRepo.create({
      name,
      pin: hashedPin,
    })

    await userRepo.save(user)

    const { pin: _, ...userWithoutPin } = user
    return userWithoutPin as Omit<User, 'pin'>
  }
}
