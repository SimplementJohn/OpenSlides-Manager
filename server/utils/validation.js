// Validation partagée (utilisée aussi côté frontend via duplication légère).

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateRegister({ name, email, password }) {
  const errors = {}
  if (!name || typeof name !== 'string' || name.trim().length < 2) errors.name = 'Nom trop court (min 2).'
  if (name && name.length > 60) errors.name = 'Nom trop long (max 60).'
  if (!email || !EMAIL_RE.test(email)) errors.email = 'Email invalide.'
  if (!password || typeof password !== 'string' || password.length < 8) errors.password = 'Mot de passe trop court (min 8).'
  if (password && password.length > 128) errors.password = 'Mot de passe trop long (max 128).'
  return { ok: Object.keys(errors).length === 0, errors }
}

export function validateLogin({ email, password }) {
  const errors = {}
  if (!email || !EMAIL_RE.test(email)) errors.email = 'Email invalide.'
  if (!password || typeof password !== 'string' || password.length < 1) errors.password = 'Mot de passe requis.'
  return { ok: Object.keys(errors).length === 0, errors }
}
