import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { register, login, logout, me } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Limite les tentatives sur les routes sensibles (anti brute-force).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessaie plus tard.' },
})

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.post('/logout', logout)
router.get('/me', requireAuth, me)

export default router
