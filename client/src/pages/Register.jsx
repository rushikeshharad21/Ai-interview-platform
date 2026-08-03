import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { User, Mail, Lock, ArrowRight, Briefcase, UserCircle, AlertCircle } from "lucide-react"
import api from "../lib/api"
import useAuthStore from "../store/authStore"
import Input from "../components/ui/Input"
import WavyBackground from "../components/ui/WavyBackground"
import { cn } from "../lib/utils"

export default function Register() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate"
  })
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
      const response = await api.post("/auth/register", formData)
      login(response.data.user, response.data.token)
      navigate("/dashboard")
    } catch (err) {
      if (!err.response) {
        setError("Network error. Please check your connection and try again.")
      } else {
        setError(err.response?.data?.message || "Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <WavyBackground />

      <div className="w-full max-w-sm rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_60px_rgba(79,70,229,0.15)] p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center">
            <User size={24} className="text-[var(--color-accent)]" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Create your account
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Start your AI-driven interview journey
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: "candidate" })}
            disabled={loading}
            className={cn(
              "flex-1 flex flex-col items-center gap-1.5 rounded-[var(--radius-control)] border py-3 text-sm font-medium transition-all duration-150 disabled:opacity-50",
              formData.role === "candidate"
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
            )}
          >
            <UserCircle size={20} />
            Candidate
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: "recruiter" })}
            disabled={loading}
            className={cn(
              "flex-1 flex flex-col items-center gap-1.5 rounded-[var(--radius-control)] border py-3 text-sm font-medium transition-all duration-150 disabled:opacity-50",
              formData.role === "recruiter"
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
            )}
          >
            <Briefcase size={20} />
            Recruiter
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full name"
            type="text"
            name="name"
            icon={User}
            placeholder="rushi harad"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            icon={Mail}
            placeholder="you@gmail.com"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
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
            disabled={loading}
            required
          />

          {error && (
            <div className="flex items-start gap-2 text-sm text-[var(--color-error)] bg-red-50 rounded-[var(--radius-control)] p-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-[var(--radius-control)] bg-gradient-to-r from-[var(--color-accent)] to-[#6366F1] text-white font-medium py-3 shadow-[0_8px_20px_rgba(79,70,229,0.35)] transition-transform duration-150 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "Creating account..." : "Create account"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="text-sm text-[var(--color-text-secondary)] text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--color-accent)] font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}