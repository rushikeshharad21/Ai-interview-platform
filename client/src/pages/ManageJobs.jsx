import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Users, MapPin, Calendar, AlertCircle } from "lucide-react"
import { getMyJobs } from "../lib/jobApi"
import Card from "../components/ui/Card"
import Badge from "../components/ui/Badge"
import Button from "../components/ui/Button"

const employmentLabels = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship"
}

export default function ManageJobs() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchJobs = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getMyJobs()
      setJobs(response.data)
    } catch (err) {
      if (!err.response) {
        setError("Network error. Please check your connection and try again.")
      } else {
        setError("Could not load your jobs. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
            My jobs
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {loading ? "Loading positions..." : `${jobs.length} posted positions`}
          </p>
        </div>
        <button
          onClick={() => navigate("/jobs/new")}
          className="flex items-center gap-2 rounded-[var(--radius-control)] bg-gradient-to-r from-[var(--color-accent)] to-[#6366F1] text-white text-sm font-medium px-4 py-2.5 shadow-[0_8px_20px_rgba(79,70,229,0.35)] transition-transform duration-150 hover:scale-[1.02]"
        >
          <Plus size={16} />
          Post a job
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-[var(--radius-card)] bg-[var(--color-surface)] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle size={24} className="text-[var(--color-error)]" />
          </div>
          <p className="text-[var(--color-text-secondary)] max-w-sm">{error}</p>
          <Button onClick={fetchJobs}>Try again</Button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <p className="text-[var(--color-text-secondary)]">You haven't posted any jobs yet</p>
          <button
            onClick={() => navigate("/jobs/new")}
            className="text-sm text-[var(--color-accent)] font-medium"
          >
            Post your first job
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job, index) => (
            <div key={job._id} className={`animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}>
              <Card
                onClick={() => navigate(`/jobs/${job._id}/applications`)}
                className="cursor-pointer flex items-center justify-between gap-4 transition-all duration-150 hover:border-[var(--color-accent)]/40 hover:shadow-[0_8px_24px_rgba(79,70,229,0.12)]"
              >
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--color-text-primary)]">
                      {job.title}
                    </h3>
                    <Badge variant={job.status === "open" ? "success" : "default"}>
                      {job.status === "open" ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <Badge>{employmentLabels[job.employmentType]}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] shrink-0">
                  <Users size={16} />
                  View applicants
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}