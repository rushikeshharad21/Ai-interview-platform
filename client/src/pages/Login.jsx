import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Lock, Mail, ArrowRight } from "lucide-react"
import api from "../lib/api"
import useAuthStore from "../store/authStore"
import Input from "../components/ui/Input"
import WavyBackground from "../components/ui/WavyBackground"

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await api.post("/auth/login", formData)
      login(response.data.user, response.data.token)
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <WavyBackground />

      <div className="w-full max-w-sm rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_60px_rgba(79,70,229,0.15)] p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center">
            <Lock size={24} className="text-[var(--color-accent)]" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Welcome back
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Log in to continue to your dashboard
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            name="email"
            icon={Mail}
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            icon={Lock}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && (
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-[var(--radius-control)] bg-gradient-to-r from-[var(--color-accent)] to-[#6366F1] text-white font-medium py-3 shadow-[0_8px_20px_rgba(79,70,229,0.35)] transition-transform duration-150 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "Logging in..." : "Log in"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-text-secondary)]">OR</span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>

        <p className="text-sm text-[var(--color-text-secondary)] text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-[var(--color-accent)] font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}