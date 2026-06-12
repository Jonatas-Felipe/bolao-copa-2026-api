import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'

// Carrega as variáveis do .env antes de o DataSource tentar acessá-las
dotenv.config()

import { User } from '@modules/users/infra/typeorm/entities/User.js'
import { Match } from '@modules/matches/infra/typeorm/entities/Match.js'
import { Guess } from '@modules/guesses/infra/typeorm/entities/Guess.js'
import { Token } from '@modules/tokens/infra/typeorm/entities/Token.js'

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  
  // Como fallback, se NODE_ENV não estiver setado, forçamos true para garantir a criação 
  // no ambiente local (lembre-se de remover ou garantir que em prod NODE_ENV seja 'production')
  synchronize: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined,
  logging: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined,
  
  entities: [User, Match, Guess, Token],
  
  // Defina o caminho onde as migrations geradas pelo CLI serão salvas
  migrations: ['./src/shared/infra/typeorm/migrations/*.ts'],
})