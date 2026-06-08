import { isProd } from '../config.js'

// 404 pour routes API inconnues.
export function notFound(req, res) {
  res.status(404).json({ error: 'Route introuvable.' })
}

// Gestionnaire d'erreurs central: jamais de stack/secret renvoyé en prod.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500
  if (!isProd) console.error('[error]', err)
  res.status(status).json({
    error: status === 500 ? 'Erreur serveur.' : (err.message || 'Erreur.'),
  })
}
