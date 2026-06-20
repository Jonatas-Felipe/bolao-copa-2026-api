import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'

// Carrega as variáveis do .env antes de o DataSource tentar acessá-las
dotenv.config()

import { User } from '@modules/users/infra/typeorm/entities/User.js'
import { Match } from '@modules/matches/infra/typeorm/entities/Match.js'
import { Guess } from '@modules/guesses/infra/typeorm/entities/Guess.js'
import { Token } from '@modules/tokens/infra/typeorm/entities/Token.js'
import { AddWeightToMatches1718880000000 } from './migrations/1718880000000-AddWeightToMatches.js'

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  
  // migrationsRun garante que a migration roda ANTES do synchronize tentar alterar o schema
  migrationsRun: true,
  synchronize: true,
  logging: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined,
  
  entities: [User, Match, Guess, Token],
  migrations: [AddWeightToMatches1718880000000],
})