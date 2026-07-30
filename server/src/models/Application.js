import mongoose from "mongoose"

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "interview_scheduled", "rejected", "hired"],
      default: "applied"
    }
  },
  { timestamps: true }
)

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true })

const Application = mongoose.model("Application", applicationSchema)

export default Application