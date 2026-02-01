import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: [true, "Event ID is required"],
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
    },
    adminNo: {
      type: String,
      required: [true, "Admin number is required"],
    },
    course: {
      type: String,
      required: [true, "Course is required"],
    },
    yearOfStudy: {
      type: String, 
      required: [true, "Year of study is required"],
    },
    reasons: {
      type: String,
      default: "",
    },
    registrationDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "registered",
    },
    receiveUpdates: {
      type: Boolean,
      default: false,
    },
    consentPhoto: {
      type: Boolean,
      default: false,
    },
    attended: {
      type: Boolean,
      default: false,
    },
    attendanceTime: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;