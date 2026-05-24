import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export function SuperadminRoute({ children }) {
  const { user, isSuperadmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!isSuperadmin) return <Navigate to="/dashboard" replace />
  return children
}
