import mongoose from "mongoose";

/**
 * User Schema
 * Supports both students and organisers
 */
const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    userType: {
      type: String,
      enum: ["student", "organiser"],
      required: [true, "User type is required"],
    },
    // Student-specific fields
    adminNo: {
      type: String,
      sparse: true,
    },
    course: {
      type: String,
    },
    yearOfStudy: {
      type: Number,
      min: 1,
      max: 3,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;