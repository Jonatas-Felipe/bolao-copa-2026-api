import 'reflect-metadata'
import dotenv from 'dotenv'
dotenv.config()
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { router } from './routes/index.js'
import { AppError } from '@shared/errors/AppError.js'
import { AppDataSource } from '@shared/infra/typeorm/data-source.js'

// Inicializa o banco de dados
AppDataSource.initialize()
  .then(() => console.log('Database connected'))
  .catch((err) => console.error('Database connection failed:', err))

const app = express()

app.use(cors())
app.use(express.json())
app.use(router)

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message })
  }

  console.error(err)
  return res.status(500).json({ message: 'Internal server error' })
})

// Named export required by vite-plugin-node
export const viteNodeApp = app
export { app }
