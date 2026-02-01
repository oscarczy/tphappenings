import express from "express";
import Registration from "../models/Registration.js";

const router = express.Router();

/**
 * GET /registrations
 * Retrieve all registrations
 * Supports optional query parameters for filtering
 */
router.get("/", async (req, res) => {
  try {
    const { eventId, userId } = req.query;
    let query = {};

    // Filter by event if provided
    if (eventId) {
      query.eventId = eventId;
    }

    // Filter by user if provided
    if (userId) {
      query.userId = userId;
    }

    const registrations = await Registration.find(query)
      .populate("eventId", "title date time location")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
      
    res.status(200).json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * GET /registrations/:id
 * Retrieve a specific registration by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate("eventId")
      .populate("userId");
    
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }
    
    res.status(200).json(registration);
  } catch (error) {
    console.error("Error fetching registration:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * POST /registrations
 * Create a new registration
 */
router.post("/", async (req, res) => {
  try {
    const {
      eventId,
      userId,
      fullName,
      email,
      adminNo,
      course,
      yearOfStudy,
      reasons,
      registrationDate,
      status,
      receiveUpdates,
      consentPhoto,
    } = req.body;

    // Validate required fields
    if (!eventId || !userId || !fullName || !email || !adminNo || !course || !yearOfStudy) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Check if user is already registered
    const existingRegistration = await Registration.findOne({ eventId, userId });
    if (existingRegistration) {
      return res.status(400).json({ message: "User is already registered for this event" });
    }

    // Generate new ID
    const lastRegistration = await Registration.findOne().sort({ id: -1 });
    const newId = lastRegistration ? String(parseInt(lastRegistration.id) + 1) : "1";

    // Create registration with ALL fields
    const newRegistration = new Registration({
      id: newId,
      eventId,
      userId,
      fullName,
      email,
      adminNo,
      course,
      yearOfStudy,
      reasons: reasons || "",
      registrationDate: registrationDate || new Date().toISOString().split("T")[0],
      status: status || "registered",
      receiveUpdates: receiveUpdates || false,
      consentPhoto: consentPhoto || false,
      attended: false,
    });

    const savedRegistration = await newRegistration.save();
    res.status(201).json(savedRegistration);
  } catch (error) {
    console.error("Error creating registration:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * PUT /registrations/:id
 * Update a registration's details (e.g., mark attendance)
 */
router.put("/:id", async (req, res) => {
  try {
    const updatedRegistration = await Registration.findOneAndUpdate(
      { id: String(req.params.id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedRegistration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    res.status(200).json(updatedRegistration);
  } catch (error) {
    console.error("Error updating registration:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * DELETE /registrations/:id
 * Delete a registration (unregister from event)
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Registration.findOneAndDelete({ id: req.params.id }); 
    if (!deleted) {
      return res.status(404).json({ message: "Registration not found" });
    }
    res.status(200).json({ message: "Registration deleted" });
  } catch (error) {
    console.error("Error deleting registration:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;