import Interview from "../models/Interview.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Answer from "../models/Answer.js";
import { generateContent, scoreAnswerContent } from "../services/geminiService.js";
import {
  calculateEmotionScore,
  calculateVoiceScore,
  calculateCompositeScore,
} from "../utils/scoring.js";

export const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, scheduledAt, duration, notes } = req.body;

    if (!applicationId || !scheduledAt) {
      return res.status(400).json({ message: "applicationId and scheduledAt are required" });
    }

    const application = await Application.findById(applicationId).populate("job");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const job = application.job;

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This application does not belong to your jobs" });
    }

    const existingInterview = await Interview.findOne({ application: applicationId });

    if (existingInterview) {
      return res.status(400).json({ message: "An interview is already scheduled for this application" });
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
    res.status(500).json({ message: "Error occurred while scheduling interview", error: error.message });
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
    res.status(500).json({ message: "Error occurred while fetching interviews", error: error.message });
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
    res.status(500).json({ message: "Error occurred while fetching interviews", error: error.message });
  }
};

export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate("job", "title location employmentType description")
      .populate("candidate", "name email")
      .populate("recruiter", "name email");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const isCandidate = interview.candidate._id.toString() === req.user._id.toString();
    const isRecruiter = interview.recruiter._id.toString() === req.user._id.toString();

    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({ message: "Not authorized to view this interview" });
    }

    res.status(200).json(interview);
  } catch (error) {
    res.status(500).json({ message: "Error occurred while fetching interview", error: error.message });
  }
};

export const updateInterviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["scheduled", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this interview" });
    }

    interview.status = status;
    await interview.save();

    res.status(200).json(interview);
  } catch (error) {
    res.status(500).json({ message: "Error occurred while updating interview", error: error.message });
  }
};

const buildQuestionPrompt = (jobTitle, jobDescription, requiredSkills) => {
  return `You are an expert technical interviewer. Based on the job details below, generate exactly 5 interview questions.

Job Title: ${jobTitle}
Job Description: ${jobDescription}
Required Skills: ${requiredSkills.join(", ")}

Rules:
- Mix of technical and behavioral questions relevant to this specific role
- Each question should be answerable in 1-2 minutes
- Return ONLY a valid JSON array of 5 strings, nothing else
- Do not include markdown code fences, numbering, or any extra text

Example format: ["Question one?", "Question two?", "Question three?", "Question four?", "Question five?"]`;
};

const parseQuestionsFromResponse = (rawText) => {
  const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleanedText);

  if (!Array.isArray(parsed)) {
    throw new Error("Response was not an array");
  }

  return parsed;
};

export const generateQuestions = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate("job");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to generate questions for this interview" });
    }

    const job = interview.job;

    const prompt = buildQuestionPrompt(job.title, job.description, job.requiredSkills);
    const rawResponse = await generateContent(prompt);

    let questions;
    try {
      questions = parseQuestionsFromResponse(rawResponse);
    } catch (parseError) {
      return res.status(502).json({
        message: "Gemini returned an unexpected format, please try again",
        rawResponse,
      });
    }

    interview.questions = questions;
    await interview.save();

    res.status(200).json({ questions: interview.questions });
  } catch (error) {
    res.status(500).json({ message: "Error generating questions", error: error.message });
  }
};

export const updateQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.some((question) => typeof question !== "string" || !question.trim())) {
      return res.status(400).json({ message: "questions must be a non-empty array of non-empty strings" });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit questions for this interview" });
    }

    interview.questions = questions;
    await interview.save();

    res.status(200).json({ questions: interview.questions });
  } catch (error) {
    res.status(500).json({ message: "Error updating questions", error: error.message });
  }
};

const calculateDominantEmotion = (emotionTrend) => {
  const counts = {};

  emotionTrend.forEach((sample) => {
    counts[sample.emotion] = (counts[sample.emotion] || 0) + 1;
  });

  let dominantEmotion = "";
  let highestCount = 0;

  Object.entries(counts).forEach(([emotion, count]) => {
    if (count > highestCount) {
      dominantEmotion = emotion;
      highestCount = count;
    }
  });

  return dominantEmotion;
};

export const saveEmotionSample = async (req, res) => {
  try {
    const { questionIndex, questionText, emotion } = req.body;

    if (typeof questionIndex !== "number" || !questionText || !emotion) {
      return res.status(400).json({ message: "questionIndex, questionText and emotion are required" });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to submit emotion data for this interview" });
    }

    let answer = await Answer.findOne({ interview: interview._id, questionIndex });

    if (!answer) {
      answer = new Answer({
        interview: interview._id,
        questionIndex,
        questionText,
        emotionTrend: [],
      });
    }

    answer.emotionTrend.push({ emotion });
    answer.dominantEmotion = calculateDominantEmotion(answer.emotionTrend);

    await answer.save();

    res.status(200).json(answer);
  } catch (error) {
    res.status(500).json({ message: "Error occurred while saving emotion data", error: error.message });
  }
};

export const saveTranscript = async (req, res) => {
  try {
    const { questionIndex, questionText, transcript } = req.body;

    if (typeof questionIndex !== "number" || !questionText || typeof transcript !== "string") {
      return res.status(400).json({ message: "questionIndex, questionText and transcript are required" });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to submit transcript for this interview" });
    }

    let answer = await Answer.findOne({ interview: interview._id, questionIndex });

    if (!answer) {
      answer = new Answer({
        interview: interview._id,
        questionIndex,
        questionText,
        emotionTrend: [],
      });
    }

    answer.transcript = transcript;
    answer.questionText = questionText;

    await answer.save();

    res.status(200).json(answer);
  } catch (error) {
    res.status(500).json({ message: "Error occurred while saving transcript", error: error.message });
  }
};

export const saveVoiceMetrics = async (req, res) => {
  try {
    const { questionIndex, questionText, speakingRatio, averagePitch, pitchVariation } = req.body;

    if (typeof questionIndex !== "number" || !questionText) {
      return res.status(400).json({ message: "questionIndex and questionText are required" });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to submit voice metrics for this interview" });
    }

    let answer = await Answer.findOne({ interview: interview._id, questionIndex });

    if (!answer) {
      answer = new Answer({
        interview: interview._id,
        questionIndex,
        questionText,
        emotionTrend: [],
      });
    }

    answer.speakingRatio = typeof speakingRatio === "number" ? speakingRatio : null;
    answer.averagePitch = typeof averagePitch === "number" ? averagePitch : null;
    answer.pitchVariation = typeof pitchVariation === "number" ? pitchVariation : null;
    answer.questionText = questionText;

    await answer.save();

    res.status(200).json(answer);
  } catch (error) {
    res.status(500).json({ message: "Error occurred while saving voice metrics", error: error.message });
  }
};

export const completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to complete this interview" });
    }

    if (interview.status === "completed") {
      const existingAnswers = await Answer.find({ interview: interview._id }).sort({ questionIndex: 1 });
      return res.status(200).json({ interview, answers: existingAnswers });
    }

    const answers = await Answer.find({ interview: interview._id }).sort({ questionIndex: 1 });

    for (const answer of answers) {
      let contentScore = null;
      let contentFeedback = "";

      try {
        const contentResult = await scoreAnswerContent(answer.questionText, answer.transcript);
        contentScore = contentResult.score;
        contentFeedback = contentResult.feedback;
      } catch (scoringError) {
        console.error(`Failed to score content for answer ${answer._id}:`, scoringError.message);
      }

      const emotionScore = calculateEmotionScore(answer.emotionTrend);
      const voiceScore = calculateVoiceScore({
        speakingRatio: answer.speakingRatio,
        pitchVariation: answer.pitchVariation,
      });

      const compositeScore = calculateCompositeScore([
        { score: contentScore, weight: 0.6 },
        { score: emotionScore, weight: 0.25 },
        { score: voiceScore, weight: 0.15 },
      ]);

      answer.contentScore = contentScore;
      answer.contentFeedback = contentFeedback;
      answer.emotionScore = emotionScore;
      answer.voiceScore = voiceScore;
      answer.compositeScore = compositeScore;
      answer.scoredAt = new Date();

      await answer.save();
    }

    interview.status = "completed";
    await interview.save();

    const scoredAnswers = await Answer.find({ interview: interview._id }).sort({ questionIndex: 1 });

    res.status(200).json({ interview, answers: scoredAnswers });
  } catch (error) {
    res.status(500).json({ message: "Error occurred while completing interview", error: error.message });
  }
};