import mongoose from "mongoose";

const emotionSampleSchema = new mongoose.Schema(
  {
    emotion: {
      type: String,
      required: true,
    },
    capturedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },
    questionIndex: {
      type: Number,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    emotionTrend: {
      type: [emotionSampleSchema],
      default: [],
    },
    dominantEmotion: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

answerSchema.index({ interview: 1, questionIndex: 1 }, { unique: true });

const Answer = mongoose.model("Answer", answerSchema);

export default Answer;