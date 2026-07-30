import Interview from "../models/Interview.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";

export const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, scheduledAt, duration, notes } = req.body;

    if (!applicationId || !scheduledAt) {
      return res.status(400).json({ message: "applicationId आणि scheduledAt आवश्यक आहेत" });
    }

    const application = await Application.findById(applicationId).populate("job");

    if (!application) {
      return res.status(404).json({ message: "Application सापडलं नाही" });
    }

    const job = application.job;

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "हे application तुमच्या jobs पैकी नाही" });
    }

    const existingInterview = await Interview.findOne({ application: applicationId });

    if (existingInterview) {
      return res.status(400).json({ message: "या application साठी आधीच interview schedule आहे" });
    }

    const interview = await Interview.create({
      application: applicationId,
      job: job._id,
      candidate: application.candidate,
      recruiter: req.user._id,
      scheduledAt,
      duration: duration || 30,
      notes: notes || "",
    });

    application.status = "interview_scheduled";
    await application.save();

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: "Interview schedule करताना त्रुटी आली", error: error.message });
  }
};

export const getMyInterviewsAsCandidate = async (req, res) => {
  try {
    const interviews = await Interview.find({ candidate: req.user._id })
      .populate("job", "title location employmentType")
      .populate("recruiter", "name email")
      .sort({ scheduledAt: 1 });

    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({ message: "Interviews आणताना त्रुटी आली", error: error.message });
  }
};

export const getMyInterviewsAsRecruiter = async (req, res) => {
  try {
    const interviews = await Interview.find({ recruiter: req.user._id })
      .populate("job", "title location employmentType")
      .populate("candidate", "name email")
      .sort({ scheduledAt: 1 });

    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({ message: "Interviews आणताना त्रुटी आली", error: error.message });
  }
};

export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate("job", "title location employmentType description")
      .populate("candidate", "name email")
      .populate("recruiter", "name email");

    if (!interview) {
      return res.status(404).json({ message: "Interview सापडलं नाही" });
    }

    const isCandidate = interview.candidate._id.toString() === req.user._id.toString();
    const isRecruiter = interview.recruiter._id.toString() === req.user._id.toString();

    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({ message: "हे interview बघण्याची परवानगी नाही" });
    }

    res.status(200).json(interview);
  } catch (error) {
    res.status(500).json({ message: "Interview आणताना त्रुटी आली", error: error.message });
  }
};

export const updateInterviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["scheduled", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "अवैध status" });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview सापडलं नाही" });
    }

    if (interview.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "हे interview update करण्याची परवानगी नाही" });
    }

    interview.status = status;
    await interview.save();

    res.status(200).json(interview);
  } catch (error) {
    res.status(500).json({ message: "Interview update करताना त्रुटी आली", error: error.message });
  }
};