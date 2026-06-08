import jwt from 'jsonwebtoken'
import { config, isProd } from '../config.js'

export function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn })
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret)
}

// Cookie httpOnly: protège le token d'un vol via XSS (JS ne peut pas le lire).
export const cookieOptions = {
  httpOnly: true,
  secure: isProd,            // HTTPS uniquement en prod
  sameSite: 'lax',           // limite le CSRF cross-site
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
}
