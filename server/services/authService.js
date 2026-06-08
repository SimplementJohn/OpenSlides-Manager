import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { config } from '../config.js'
import { findByEmail, insertUser } from '../utils/store.js'

// Logique métier auth, isolée des routes Express (testable).

export async function registerUser({ name, email, password }) {
  const normalized = email.toLowerCase().trim()
  const existing = await findByEmail(normalized)
  if (existing) {
    const e = new Error('Un compte existe déjà avec cet email.')
    e.status = 409
    throw e
  }
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds)
  const user = {
    id: randomUUID(),
    name: name.trim(),
    email: normalized,
    passwordHash,
    createdAt: new Date().toISOString(),
  }
  await insertUser(user)
  return publicUser(user)
}

export async function authenticate({ email, password }) {
  const normalized = email.toLowerCase().trim()
  const user = await findByEmail(normalized)
  // Compare toujours pour limiter le timing leak (hash factice si user absent).
  const hash = user?.passwordHash || '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinv'
  const ok = await bcrypt.compare(password, hash)
  if (!user || !ok) {
    const e = new Error('Email ou mot de passe incorrect.')
    e.status = 401
    throw e
  }
  return publicUser(user)
}

// Ne jamais renvoyer le hash au client.
export function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt }
}
