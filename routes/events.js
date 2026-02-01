import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

/**
 * GET /events
 * Retrieve all events
 * Supports optional query parameters for filtering
 */
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    // Filter by category if provided
    if (category && category !== "All") {
      query.category = category;
    }

    // Search by title if provided
    if (search) {
      query.title = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    const events = await Event.find(query).sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * GET /events/:id
 * Retrieve a specific event by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * POST /events
 * Create a new event
 */
router.post("/", async (req, res) => {
  try {
    const { title, description, date, time, location, category, maxParticipants, organizer, organizerId, organizerAvatar, image } = req.body;

    if (!title || !description || !date || !time || !location || !category || maxParticipants == null || !organizer || !organizerId) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Validate date is not in the past
    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      return res.status(400).json({ message: "Event date must be today or in the future" });
    }

    // Validate end time is after start time
    const parts = time.split(' - ');
    if (parts.length !== 2) {
      return res.status(400).json({ message: "Invalid time format. Use 'HH:MM AM/PM - HH:MM AM/PM'" });
    }

    const startTime = new Date(`2000-01-01 ${parts[0].trim()}`);
    const endTime = new Date(`2000-01-01 ${parts[1].trim()}`);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return res.status(400).json({ message: "Invalid time format" });
    }

    if (endTime <= startTime) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      time,
      location,
      category,
      maxParticipants,
      spotsRemaining: maxParticipants,
      organizer,
      organizerId,
      organizerAvatar: organizerAvatar || "OR",
      image: image || "",
      stats: { registered: 0, attended: 0, attendanceRate: 0 },
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * PUT /events/:id
 * Update an event's details
 */
router.put("/:id", async (req, res) => {
  try {
    // Validate date if provided
    if (req.body.date) {
      const eventDate = new Date(req.body.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (eventDate < today) {
        return res.status(400).json({ message: "Event date must be today or in the future" });
      }
    }

    // Validate time if provided
    if (req.body.time) {
      const parts = req.body.time.split(' - ');
      if (parts.length !== 2) {
        return res.status(400).json({ message: "Invalid time format. Use 'HH:MM AM/PM - HH:MM AM/PM'" });
      }

      const startTime = new Date(`2000-01-01 ${parts[0].trim()}`);
      const endTime = new Date(`2000-01-01 ${parts[1].trim()}`);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return res.status(400).json({ message: "Invalid time format" });
      }

      if (endTime <= startTime) {
        return res.status(400).json({ message: "End time must be after start time" });
      }
    }

    // Recalculate spotsRemaining if maxParticipants changed
    if (req.body.maxParticipants !== undefined) {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const registered = event.maxParticipants - event.spotsRemaining;
      req.body.spotsRemaining = req.body.maxParticipants - registered;

      // Prevent negative spots
      if (req.body.spotsRemaining < 0) {
        return res.status(400).json({ 
          message: `Cannot reduce max participants below current registrations (${registered})` 
        });
      }
    }

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * DELETE /events/:id
 * Delete an event
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;