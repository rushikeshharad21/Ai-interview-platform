import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { MapPin, Calendar, Building2, CheckCircle2, AlertCircle } from "lucide-react"
import { getJobById } from "../lib/jobApi"
import { applyToJob } from "../lib/applicationApi"
import useAuthStore from "../store/authStore"
import Card from "../components/ui/Card"
import Badge from "../components/ui/Badge"
import Button from "../components/ui/Button"

const employmentLabels = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship"
}

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [fetchError, setFetchError] = useState("")
  const [applyError, setApplyError] = useState("")

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true)
      setFetchError("")

      try {
        const response = await getJobById(id)
        setJob(response.data)
      } catch (err) {
        if (!err.response) {
          setFetchError("Network error. Please check your connection and try again.")
        } else if (err.response.status === 404) {
          setFetchError("This job posting could not be found. It may have been removed.")
        } else {
          setFetchError("Could not load this job. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [id])

  const handleApply = async () => {
    setApplying(true)
    setApplyError("")

    try {
      await applyToJob(id)
      setApplied(true)
    } catch (err) {
      if (!err.response) {
        setApplyError("Network error. Please check your connection and try again.")
      } else {
        setApplyError(err.response?.data?.message || "Something went wrong. Please try again.")
      }
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return <div className="h-64 rounded-[var(--radius-card)] bg-[var(--color-surface)] animate-pulse" />
  }

  if (!job) {
    return (
      <div className="max-w-2xl flex flex-col gap-4">
        <button
          onClick={() => navigate("/jobs")}
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors duration-150 self-start"
        >
          ← Back to jobs
        </button>

        <Card>
          <div className="flex flex-col items-center text-center py-8 gap-3">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle size={24} className="text-[var(--color-error)]" />
            </div>
            <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Unable to Load Job
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">
              {fetchError || "Job not found"}
            </p>
            <Button onClick={() => navigate("/jobs")} className="mt-2">
              Back to jobs
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <button
        onClick={() => navigate("/jobs")}
        className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors duration-150 self-start"
      >
        ← Back to jobs
      </button>

      <Card className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
              <Building2 size={22} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
                {job.title}
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {job.recruiter?.name}
              </p>
            </div>
          </div>
          <Badge variant="accent">{employmentLabels[job.employmentType]}</Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1.5">
            <MapPin size={16} />
            {job.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={16} />
            Posted {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
            About this role
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {job.description}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
            Required skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>
        </div>

        {applyError && (
          <div className="flex items-start gap-2 text-sm text-[var(--color-error)] bg-red-50 rounded-[var(--radius-control)] p-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>{applyError}</p>
          </div>
        )}

        {user?.role === "candidate" && (
          <div className="pt-2 border-t border-[var(--color-border)]">
            {applied ? (
              <div className="flex items-center gap-2 text-sm text-[var(--color-success)] font-medium py-2.5">
                <CheckCircle2 size={18} />
                Application submitted
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying}
                className="w-full flex items-center justify-center gap-2 rounded-[var(--radius-control)] bg-gradient-to-r from-[var(--color-accent)] to-[#6366F1] text-white font-medium py-2.5 shadow-[0_8px_20px_rgba(79,70,229,0.35)] transition-transform duration-150 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              >
                {applying ? "Submitting..." : "Apply now"}
              </button>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}