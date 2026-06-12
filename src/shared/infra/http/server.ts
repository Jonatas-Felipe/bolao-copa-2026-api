import 'reflect-metadata'
import dotenv from 'dotenv'
dotenv.config()
import { AppDataSource } from '@shared/infra/typeorm/data-source.js'
import { app } from './app.js'
import { startCronJobs } from '@shared/infra/cron/jobs.js'

const PORT = Number(process.env.PORT) || 3001

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected')

    startCronJobs()

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Database connection failed:', err)
    process.exit(1)
  })
