import api from "./api.js"

export const googleAuth = async ({ credential, role }) => {
  const response = await api.post("/auth/google", { credential, role })
  return response.data
}