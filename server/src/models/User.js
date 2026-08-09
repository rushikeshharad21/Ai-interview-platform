import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: false
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    avatar: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["candidate", "recruiter", "admin"],
      default: "candidate"
    }
  },
  { timestamps: true }
)

const User = mongoose.model("User", userSchema)

export default User