import express from "express";
import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";
import {
  scheduleInterview,
  getMyInterviewsAsCandidate,
  getMyInterviewsAsRecruiter,
  getInterviewById,
  updateInterviewStatus,
} from "../controllers/interviewController.js";

const router = express.Router();

router.post("/", protect, requireRole("recruiter"), scheduleInterview);
router.get("/candidate/my", protect, getMyInterviewsAsCandidate);
router.get("/recruiter/my", protect, requireRole("recruiter"), getMyInterviewsAsRecruiter);
router.get("/:id", protect, getInterviewById);
router.patch("/:id/status", protect, requireRole("recruiter"), updateInterviewStatus);

export default router;