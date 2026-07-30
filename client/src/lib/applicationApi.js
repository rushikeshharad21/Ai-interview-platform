import api from "./api"

export const applyToJob = (jobId) => api.post("/applications", { jobId })
export const getMyApplications = () => api.get("/applications/my-applications")
export const getApplicationsForJob = (jobId) => api.get(`/applications/job/${jobId}`)
export const updateApplicationStatus = (id, status) =>
  api.put(`/applications/${id}/status`, { status })