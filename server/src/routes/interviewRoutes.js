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

export default router;