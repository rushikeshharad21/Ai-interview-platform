import { create } from "zustand"
import { isTokenExpired } from "../lib/jwt"

const storedToken = localStorage.getItem("token")
const storedUser = localStorage.getItem("user")
const validSession = storedToken && !isTokenExpired(storedToken)

const useAuthStore = create((set) => ({
  user: validSession ? JSON.parse(storedUser) : null,
  token: validSession ? storedToken : null,

  login: (user, token) => {
    localStorage.setItem("user", JSON.stringify(user))
    localStorage.setItem("token", token)
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    set({ user: null, token: null })
  }
}))

export default useAuthStore