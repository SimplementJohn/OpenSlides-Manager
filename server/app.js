import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from './config.js'
import authRoutes from './routes/auth.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  app.use(helmet())                                   // en-têtes de sécurité
  app.use(cors({ origin: config.corsOrigin, credentials: true })) // cookies cross-origin en dev
  app.use(express.json({ limit: '100kb' }))           // limite la taille du body (anti-DoS)
  app.use(cookieParser())

  app.get('/api/health', (req, res) => res.json({ ok: true, env: config.nodeEnv }))
  app.use('/api/auth', authRoutes)

  app.use('/api', notFound)
  app.use(errorHandler)
  return app
}
