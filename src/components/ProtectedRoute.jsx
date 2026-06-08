import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

// Garde une route privée: attend la session, redirige vers /login si absent.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const loc = useLocation()

  if (loading) {
    return <div className="container page" style={{ minHeight: '50vh', display: 'grid', placeItems: 'center' }}>
      <span className="loader" />
    </div>
  }
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return children
}
