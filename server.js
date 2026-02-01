import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/users.js";
import eventRoutes from "./routes/events.js";
import registrationRoutes from "./routes/registrations.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Set port and start server
const PORT = process.env.PORT || 5050;

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-vercel-app.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/users", userRoutes);
app.use("/events", eventRoutes);
app.use("/registrations", registrationRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});