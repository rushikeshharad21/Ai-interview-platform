import express from "express"
import { protect } from "../middleware/auth.js"
import { requireRole } from "../middleware/roleCheck.js"
import {
  createJob,
  getAllJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob
} from "../controllers/jobController.js"

const router = express.Router()

router.get("/", getAllJobs)
router.get("/my-jobs", protect, requireRole("recruiter"), getMyJobs)
router.get("/:id", getJobById)
router.post("/", protect, requireRole("recruiter"), createJob)
router.put("/:id", protect, requireRole("recruiter"), updateJob)
router.delete("/:id", protect, requireRole("recruiter"), deleteJob)

export default router