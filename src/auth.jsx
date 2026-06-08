import { createContext, useContext, useEffect, useState, useCallback } from 'react'

// Auth côté client: cookie httpOnly géré par le backend, on n'expose jamais le token au JS.
const AuthCtx = createContext(null)

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api/auth${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // envoie/reçoit le cookie de session
  })
  let data = null
  try { data = await res.json() } catch { /* pas de corps */ }
  if (!res.ok) {
    const err = new Error(data?.error || 'Erreur réseau.')
    err.status = res.status
    err.fields = data?.fields || null
    throw err
  }
  return data
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Récupère la session au chargement (cookie -> /me).
  useEffect(() => {
    let alive = true
    api('/me')
      .then((d) => { if (alive) setUser(d.user) })
      .catch(() => { if (alive) setUser(null) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const login = useCallback(async (email, password) => {
    const d = await api('/login', { method: 'POST', body: { email, password } })
    setUser(d.user); return d.user
  }, [])

  const register = useCallback(async (name, email, password) => {
    const d = await api('/register', { method: 'POST', body: { name, email, password } })
    setUser(d.user); return d.user
  }, [])

  const logout = useCallback(async () => {
    try { await api('/logout', { method: 'POST' }) } finally { setUser(null) }
  }, [])

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
