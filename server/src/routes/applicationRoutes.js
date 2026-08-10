import express from "express"
import { protect } from "../middleware/auth.js"
import { requireRole } from "../middleware/roleCheck.js"
import {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
  getRecruiterSummary,
  getRecruiterApplications
} from "../controllers/applicationController.js"

const router = express.Router()

router.post("/", protect, requireRole("candidate"), applyToJob)
router.get("/my-applications", protect, requireRole("candidate"), getMyApplications)
router.get("/recruiter/summary", protect, requireRole("recruiter"), getRecruiterSummary)
router.get("/recruiter/all", protect, requireRole("recruiter"), getRecruiterApplications)
router.get("/job/:jobId", protect, requireRole("recruiter"), getApplicationsForJob)
router.put("/:id/status", protect, requireRole("recruiter"), updateApplicationStatus)

export default router