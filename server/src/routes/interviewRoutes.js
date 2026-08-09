import express from "express";
import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";
import {
  scheduleInterview,
  getMyInterviewsAsCandidate,
  getMyInterviewsAsRecruiter,
  getInterviewById,
  updateInterviewStatus,
  generateQuestions,
  updateQuestions,
  saveEmotionSample,
  saveTranscript,
  saveVoiceMetrics,
  completeInterview,
} from "../controllers/interviewController.js";

const router = express.Router();

router.post("/", protect, requireRole("recruiter"), scheduleInterview);
router.get("/candidate/my", protect, getMyInterviewsAsCandidate);
router.get("/recruiter/my", protect, requireRole("recruiter"), getMyInterviewsAsRecruiter);
router.get("/:id", protect, getInterviewById);
router.patch("/:id/status", protect, requireRole("recruiter"), updateInterviewStatus);
router.post("/:id/generate-questions", protect, requireRole("recruiter"), generateQuestions);
router.patch("/:id/questions", protect, requireRole("recruiter"), updateQuestions);
router.post("/:id/emotions", protect, saveEmotionSample);
router.post("/:id/transcript", protect, saveTranscript);
router.post("/:id/voice-metrics", protect, saveVoiceMetrics);
router.post("/:id/complete", protect, completeInterview);

export default router;