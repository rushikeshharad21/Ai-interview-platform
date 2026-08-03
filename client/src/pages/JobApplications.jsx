import { useEffect, useState, Fragment } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Mail, AlertCircle, CalendarPlus, X, Check } from "lucide-react"
import { getApplicationsForJob, updateApplicationStatus } from "../lib/applicationApi"
import { getJobById } from "../lib/jobApi"
import { scheduleInterview } from "../lib/interviewApi"
import Card from "../components/ui/Card"
import StatusBadge from "../components/ui/StatusBadge"
import Select from "../components/ui/Select"
import Input from "../components/ui/Input"
import Textarea from "../components/ui/Textarea"
import Button from "../components/ui/Button"

const statusOptions = [
  { value: "applied", label: "Applied" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "rejected", label: "Rejected" },
  { value: "hired", label: "Hired" }
]

const emptyScheduleForm = { scheduledAt: "", duration: 30, notes: "" }

export default function JobApplications() {
  const { jobId } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState("")
  const [statusError, setStatusError] = useState("")
  const [updatingId, setUpdatingId] = useState(null)

  const [schedulingAppId, setSchedulingAppId] = useState(null)
  const [scheduleForm, setScheduleForm] = useState(emptyScheduleForm)
  const [scheduling, setScheduling] = useState(false)
  const [scheduleError, setScheduleError] = useState("")

  const fetchData = async () => {
    setLoading(true)
    setFetchError("")

    try {
      const [jobRes, appsRes] = await Promise.all([
        getJobById(jobId),
        getApplicationsForJob(jobId)
      ])
      setJob(jobRes.data)
      setApplications(appsRes.data)
    } catch (err) {
      if (!err.response) {
        setFetchError("Network error. Please check your connection and try again.")
      } else {
        setFetchError("Could not load applications. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [jobId])

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId)
    setStatusError("")

    try {
      await updateApplicationStatus(applicationId, newStatus)
      setApplications((prev) =>
        prev.map((app) => (app._id === applicationId ? { ...app, status: newStatus } : app))
      )
    } catch (err) {
      if (!err.response) {
        setStatusError("Network error. Could not update status, please try again.")
      } else {
        setStatusError(err.response?.data?.message || "Could not update status. Please try again.")
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const openScheduleForm = (applicationId) => {
    setSchedulingAppId(applicationId)
    setScheduleForm(emptyScheduleForm)
    setScheduleError("")
  }

  const closeScheduleForm = () => {
    setSchedulingAppId(null)
    setScheduleForm(emptyScheduleForm)
    setScheduleError("")
  }

  const handleScheduleFieldChange = (field, value) => {
    setScheduleForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleScheduleSubmit = async (applicationId) => {
    if (!scheduleForm.scheduledAt) {
      setScheduleError("Please choose a date and time for the interview")
      return
    }

    setScheduling(true)
    setScheduleError("")

    try {
      await scheduleInterview({
        applicationId,
        scheduledAt: new Date(scheduleForm.scheduledAt).toISOString(),
        duration: Number(scheduleForm.duration) || 30,
        notes: scheduleForm.notes
      })

      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: "interview_scheduled" } : app
        )
      )
      closeScheduleForm()
    } catch (err) {
      if (!err.response) {
        setScheduleError("Network error. Please check your connection and try again.")
      } else {
        setScheduleError(err.response?.data?.message || "Could not schedule interview. Please try again.")
      }
    } finally {
      setScheduling(false)
    }
  }

  if (loading) {
    return <div className="h-64 rounded-[var(--radius-card)] bg-[var(--color-surface)] animate-pulse" />
  }

  if (fetchError) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate("/jobs/manage")}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors duration-150 self-start"
        >
          <ArrowLeft size={16} />
          Back to my jobs
        </button>

        <Card>
          <div className="flex flex-col items-center text-center py-8 gap-3">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle size={24} className="text-[var(--color-error)]" />
            </div>
            <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Unable to Load Applications
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">{fetchError}</p>
            <Button onClick={fetchData} className="mt-2">Try again</Button>
          </div>
        </Card>
      </div>
    )
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

      {statusError && (
        <div className="flex items-start gap-2 text-sm text-[var(--color-error)] bg-red-50 rounded-[var(--radius-control)] p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>{statusError}</p>
        </div>
      )}

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
                <th className="px-6 py-3.5 font-medium text-[var(--color-text-secondary)]">Interview</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <Fragment key={app._id}>
                  <tr className="border-b border-[var(--color-border)] last:border-0">
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
                        disabled={updatingId === app._id}
                      />
                    </td>
                    <td className="px-6 py-4 w-56">
                      {app.status === "interview_scheduled" ? (
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          Already scheduled
                        </span>
                      ) : schedulingAppId === app._id ? (
                        <button
                          onClick={closeScheduleForm}
                          className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
                        >
                          <X size={14} />
                          Cancel
                        </button>
                      ) : (
                        <button
                          onClick={() => openScheduleForm(app._id)}
                          className="flex items-center gap-1.5 text-sm text-[var(--color-accent)] font-medium"
                        >
                          <CalendarPlus size={16} />
                          Schedule Interview
                        </button>
                      )}
                    </td>
                  </tr>

                  {schedulingAppId === app._id && (
                    <tr className="border-b border-[var(--color-border)] last:border-0">
                      <td colSpan={5} className="px-6 py-4 bg-[var(--color-surface)]">
                        <div className="flex flex-col gap-3 max-w-xl">
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            Schedule interview with {app.candidate?.name}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                              label="Date & time"
                              type="datetime-local"
                              value={scheduleForm.scheduledAt}
                              onChange={(e) => handleScheduleFieldChange("scheduledAt", e.target.value)}
                              disabled={scheduling}
                              required
                            />
                            <Input
                              label="Duration (minutes)"
                              type="number"
                              min={5}
                              value={scheduleForm.duration}
                              onChange={(e) => handleScheduleFieldChange("duration", e.target.value)}
                              disabled={scheduling}
                            />
                          </div>

                          <Textarea
                            label="Notes (optional)"
                            rows={2}
                            placeholder="Anything the candidate should know before the interview"
                            value={scheduleForm.notes}
                            onChange={(e) => handleScheduleFieldChange("notes", e.target.value)}
                            disabled={scheduling}
                          />

                          {scheduleError && (
                            <div className="flex items-start gap-2 text-sm text-[var(--color-error)] bg-red-50 rounded-[var(--radius-control)] p-3">
                              <AlertCircle size={16} className="mt-0.5 shrink-0" />
                              <p>{scheduleError}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleScheduleSubmit(app._id)}
                              disabled={scheduling}
                              className="flex items-center gap-1.5"
                            >
                              <Check size={14} />
                              {scheduling ? "Scheduling..." : "Confirm Schedule"}
                            </Button>
                            <button
                              onClick={closeScheduleForm}
                              disabled={scheduling}
                              className="text-sm text-[var(--color-text-secondary)] px-3 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}