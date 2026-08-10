import Application from "../models/Application.js"
import Job from "../models/Job.js"

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

export const getRecruiterSummary = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id })
    const jobIds = jobs.map((job) => job._id)

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("job", "title location")
      .populate("candidate", "name email")
      .sort({ createdAt: -1 })

    const openJobsCount = jobs.filter((job) => job.status === "open").length
    const totalApplications = applications.length
    const shortlistedCount = applications.filter((application) => application.status === "shortlisted").length
    const recentApplications = applications.slice(0, 5)

    res.status(200).json({
      openJobsCount,
      totalJobsCount: jobs.length,
      totalApplications,
      shortlistedCount,
      recentApplications,
    })
  } catch (error) {
    res.status(500).json({ message: "Error occurred while fetching dashboard summary", error: error.message })
  }
}

export const getRecruiterApplications = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id })
    const jobIds = jobs.map((job) => job._id)

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("job", "title location")
      .populate("candidate", "name email")
      .sort({ createdAt: -1 })

    res.status(200).json(applications)
  } catch (error) {
    res.status(500).json({ message: "Error occurred while fetching applications", error: error.message })
  }
}