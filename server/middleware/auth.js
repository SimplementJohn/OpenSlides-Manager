import { verifyToken } from '../utils/token.js'
import { config } from '../config.js'
import { findById } from '../utils/store.js'

// Protège les routes privées: exige un cookie JWT valide + utilisateur existant.
export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[config.cookieName]
    if (!token) return res.status(401).json({ error: 'Authentification requise.' })

    const payload = verifyToken(token) // lève si expiré/invalide
    const user = await findById(payload.sub)
    if (!user) return res.status(401).json({ error: 'Session invalide.' })

    req.user = { id: user.id, email: user.email, name: user.name }
    next()
  } catch (err) {
    const expired = err?.name === 'TokenExpiredError'
    return res.status(401).json({ error: expired ? 'Session expirée.' : 'Token invalide.' })
  }
}
