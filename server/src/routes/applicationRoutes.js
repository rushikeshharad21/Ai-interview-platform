import express from "express"
import { protect } from "../middleware/auth.js"
import { requireRole } from "../middleware/roleCheck.js"
import {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus
} from "../controllers/applicationController.js"

const router = express.Router()

router.post("/", protect, requireRole("candidate"), applyToJob)
router.get("/my-applications", protect, requireRole("candidate"), getMyApplications)
router.get("/job/:jobId", protect, requireRole("recruiter"), getApplicationsForJob)
router.put("/:id/status", protect, requireRole("recruiter"), updateApplicationStatus)

export default router