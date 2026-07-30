import Application from "../models/Application.js"

export const applyToJob = async (req, res) => {
  const { jobId } = req.body

  const existing = await Application.findOne({ job: jobId, candidate: req.user._id })
  if (existing) {
    return res.status(400).json({ message: "You have already applied to this job" })
  }

  const application = await Application.create({
    job: jobId,
    candidate: req.user._id
  })

  res.status(201).json(application)
}

export const getMyApplications = async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id })
    .populate("job")
    .sort({ createdAt: -1 })

  res.json(applications)
}

export const getApplicationsForJob = async (req, res) => {
  const applications = await Application.find({ job: req.params.jobId })
    .populate("candidate", "name email")
    .sort({ createdAt: -1 })

  res.json(applications)
}

export const updateApplicationStatus = async (req, res) => {
  const { status } = req.body

  const application = await Application.findById(req.params.id)
  if (!application) {
    return res.status(404).json({ message: "Application not found" })
  }

  application.status = status
  await application.save()

  res.json(application)
}