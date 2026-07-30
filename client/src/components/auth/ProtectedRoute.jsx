import { Navigate } from "react-router-dom"
import useAuthStore from "../../store/authStore"
import AppLayout from "../layout/AppLayout"

export default function ProtectedRoute() {
  const { user, logout } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <AppLayout user={user} onLogout={logout} />
}