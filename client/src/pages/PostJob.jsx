import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Briefcase } from "lucide-react"
import { createJob } from "../lib/jobApi"
import Input from "../components/ui/Input"
import Textarea from "../components/ui/Textarea"
import Select from "../components/ui/Select"
import SkillInput from "../components/ui/SkillInput"

const employmentOptions = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" }
]

export default function PostJob() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "Remote",
    employmentType: "full-time"
  })
  const [skills, setSkills] = useState([])
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
      await createJob({ ...formData, requiredSkills: skills })
      navigate("/jobs/manage")
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
          <Briefcase size={20} className="text-[var(--color-accent)]" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
            Post a new job
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Fill in the details candidates will see
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Job title"
          name="title"
          placeholder="e.g. Frontend Developer"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <Textarea
          label="Description"
          name="description"
          rows={5}
          placeholder="Describe the role, responsibilities, and expectations"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <SkillInput label="Required skills" skills={skills} onChange={setSkills} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Location"
            name="location"
            placeholder="Remote / City name"
            value={formData.location}
            onChange={handleChange}
          />
          <Select
            label="Employment type"
            name="employmentType"
            options={employmentOptions}
            value={formData.employmentType}
            onChange={handleChange}
          />
        </div>

        {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-[var(--radius-control)] bg-gradient-to-r from-[var(--color-accent)] to-[#6366F1] text-white font-medium px-6 py-2.5 shadow-[0_8px_20px_rgba(79,70,229,0.35)] transition-transform duration-150 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "Posting..." : "Post job"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/jobs/manage")}
            className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-6 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition-colors duration-150"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}