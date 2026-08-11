import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { User, Mail, Lock, ArrowRight, Briefcase, UserCircle, AlertCircle } from "lucide-react"
import { GoogleLogin } from "@react-oauth/google"
import api from "../lib/api"
import { googleAuth } from "../lib/authApi"
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

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("")
    setLoading(true)

    try {
      const data = await googleAuth({
        credential: credentialResponse.credential,
        role: formData.role
      })
      login(data.user, data.token)
      navigate("/dashboard")
    } catch (err) {
      if (!err.response) {
        setError("Network error. Please check your connection and try again.")
      } else {
        setError(err.response?.data?.message || "Google sign-in failed. Please try again.")
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
          <div className="w-14 h-14 rounded-2xl bg-[#4F46E5]/10 flex items-center justify-center">
            <User size={24} className="text-[#4F46E5]" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-semibold text-[#0A0A0A]">
              Create your account
            </h1>
            <p className="text-sm text-[#6B7280]">
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
                ? "border-[#4F46E5] bg-[#4F46E5]/10 text-[#4F46E5]"
                : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F7F8FA]"
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
                ? "border-[#4F46E5] bg-[#4F46E5]/10 text-[#4F46E5]"
                : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F7F8FA]"
            )}
          >
            <Briefcase size={20} />
            Recruiter
          </button>
        </div>

        <p className="text-xs text-[#6B7280] -mt-4 text-center">
          Choose your role above before continuing, including with Google
        </p>

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
            labelClassName="text-[#0A0A0A]"
            className="bg-white text-[#0A0A0A] placeholder:text-[#9CA3AF] border-[#E5E7EB]"
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
            labelClassName="text-[#0A0A0A]"
            className="bg-white text-[#0A0A0A] placeholder:text-[#9CA3AF] border-[#E5E7EB]"
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
            labelClassName="text-[#0A0A0A]"
            className="bg-white text-[#0A0A0A] placeholder:text-[#9CA3AF] border-[#E5E7EB]"
          />

          {error && (
            <div className="flex items-start gap-2 text-sm text-[#DC2626] bg-red-50 rounded-[var(--radius-control)] p-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-[var(--radius-control)] bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white font-medium py-3 shadow-[0_8px_20px_rgba(79,70,229,0.35)] transition-transform duration-150 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "Creating account..." : "Create account"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <span className="text-xs text-[#6B7280]">OR</span>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google sign-in failed. Please try again.")}
          />
        </div>

        <p className="text-sm text-[#6B7280] text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-[#4F46E5] font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}