import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
    },
    date: {
      type: String,
      required: [true, "Event date is required"],
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      enum: ["Workshop", "Seminar", "Conference", "Networking", "Competition", "Other"],
    },
    maxParticipants: {
      type: Number,
      required: [true, "Maximum participants is required"],
      min: [1, "Must have at least 1 participant slot"],
    },
    spotsRemaining: {
      type: Number,
      required: true,
    },
    organizer: {
      type: String,
      required: true,
    },
    organizerId: {
      type: String,
      required: true,
    },
    organizerAvatar: {
      type: String,
      default: "OR",
    },
    image: {
      type: String,
      default: "",
    },
    attendanceKey: {
      type: String,
      default: null,
    },
    stats: {
      registered: {
        type: Number,
        default: 0,
      },
      attended: {
        type: Number,
        default: 0,
      },
      attendanceRate: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;