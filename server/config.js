import dotenv from 'dotenv'
dotenv.config()

const required = (key, fallback) => {
  const v = process.env[key] ?? fallback
  if (v === undefined) throw new Error(`Variable d'environnement manquante: ${key}`)
  return v
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  // En prod, JWT_SECRET DOIT être défini (>=32 chars). En dev, fallback explicite.
  jwtSecret: required('JWT_SECRET', process.env.NODE_ENV === 'production' ? undefined : 'dev-only-insecure-secret-change-me-32x'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'osm_token',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  dataDir: process.env.DATA_DIR || './server/data',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
}

export const isProd = config.nodeEnv === 'production'
