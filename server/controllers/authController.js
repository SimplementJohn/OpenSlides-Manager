import { config } from '../config.js'
import { signToken, cookieOptions } from '../utils/token.js'
import { validateRegister, validateLogin } from '../utils/validation.js'
import { registerUser, authenticate } from '../services/authService.js'

function setAuthCookie(res, user) {
  const token = signToken({ sub: user.id, email: user.email })
  res.cookie(config.cookieName, token, cookieOptions)
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {}
    const { ok, errors } = validateRegister({ name, email, password })
    if (!ok) return res.status(422).json({ error: 'Données invalides.', fields: errors })

    const user = await registerUser({ name, email, password })
    setAuthCookie(res, user)
    res.status(201).json({ user })
  } catch (err) { next(err) }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {}
    const { ok, errors } = validateLogin({ email, password })
    if (!ok) return res.status(422).json({ error: 'Données invalides.', fields: errors })

    const user = await authenticate({ email, password })
    setAuthCookie(res, user)
    res.json({ user })
  } catch (err) { next(err) }
}

export async function logout(req, res) {
  res.clearCookie(config.cookieName, { ...cookieOptions, maxAge: undefined })
  res.json({ ok: true })
}

export async function me(req, res) {
  res.json({ user: req.user })
}
