import Job from "../models/Job.js"

export const createJob = async (req, res) => {
  const { title, description, requiredSkills, location, employmentType } = req.body

  const job = await Job.create({
    title,
    description,
    requiredSkills,
    location,
    employmentType,
    recruiter: req.user._id
  })

  res.status(201).json(job)
}

export const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ status: "open" })
    .populate("recruiter", "name email")
    .sort({ createdAt: -1 })

  res.json(jobs)
}

export const getMyJobs = async (req, res) => {
  const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 })
  res.json(jobs)
}

export const getJobById = async (req, res) => {
  const job = await Job.findById(req.params.id).populate("recruiter", "name email")

  if (!job) {
    return res.status(404).json({ message: "Job not found" })
  }

  res.json(job)
}

export const updateJob = async (req, res) => {
  const job = await Job.findById(req.params.id)

  if (!job) {
    return res.status(404).json({ message: "Job not found" })
  }

  if (job.recruiter.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized to edit this job" })
  }

  Object.assign(job, req.body)
  await job.save()

  res.json(job)
}

export const deleteJob = async (req, res) => {
  const job = await Job.findById(req.params.id)

  if (!job) {
    return res.status(404).json({ message: "Job not found" })
  }

  if (job.recruiter.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized to delete this job" })
  }

  await job.deleteOne()

  res.json({ message: "Job deleted" })
}