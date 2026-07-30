import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Mail } from "lucide-react"
import { getApplicationsForJob, updateApplicationStatus } from "../lib/applicationApi"
import { getJobById } from "../lib/jobApi"
import Card from "../components/ui/Card"
import StatusBadge from "../components/ui/StatusBadge"
import Select from "../components/ui/Select"

const statusOptions = [
  { value: "applied", label: "Applied" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "rejected", label: "Rejected" },
  { value: "hired", label: "Hired" }
]

export default function JobApplications() {
  const { jobId } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, appsRes] = await Promise.all([
          getJobById(jobId),
          getApplicationsForJob(jobId)
        ])
        setJob(jobRes.data)
        setApplications(appsRes.data)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [jobId])

  const handleStatusChange = async (applicationId, newStatus) => {
    await updateApplicationStatus(applicationId, newStatus)
    setApplications((prev) =>
      prev.map((app) => (app._id === applicationId ? { ...app, status: newStatus } : app))
    )
  }

  if (loading) {
    return <div className="h-64 rounded-[var(--radius-card)] bg-[var(--color-surface)] animate-pulse" />
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => navigate("/jobs/manage")}
        className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors duration-150 self-start"
      >
        <ArrowLeft size={16} />
        Back to my jobs
      </button>

      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          {job?.title}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {applications.length} applicants
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-[var(--color-text-secondary)]">No applications yet</p>
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left">
                <th className="px-6 py-3.5 font-medium text-[var(--color-text-secondary)]">Candidate</th>
                <th className="px-6 py-3.5 font-medium text-[var(--color-text-secondary)]">Applied on</th>
                <th className="px-6 py-3.5 font-medium text-[var(--color-text-secondary)]">Status</th>
                <th className="px-6 py-3.5 font-medium text-[var(--color-text-secondary)]">Update status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-[var(--color-text-primary)]">
                        {app.candidate?.name}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                        <Mail size={12} />
                        {app.candidate?.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-6 py-4 w-48">
                    <Select
                      options={statusOptions}
                      value={app.status}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}