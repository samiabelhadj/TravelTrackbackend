const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

// Import controllers (to be created)
// const diaryController = require("../controllers/diaryController");

// Validation middleware
const validateDiaryEntry = [
  body("title").notEmpty().trim().withMessage("Title is required"),
  body("content").notEmpty().trim().withMessage("Content is required"),
  body("date").isISO8601().withMessage("Valid date is required"),
];

// Routes
// GET /api/diary/trips/:tripId/entries
router.get("/trips/:tripId/entries", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Get diary entries endpoint - to be implemented",
  });
});

// GET /api/diary/trips/:tripId/entries/:entryId
router.get("/trips/:tripId/entries/:entryId", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Get diary entry endpoint - to be implemented",
  });
});

// POST /api/diary/trips/:tripId/entries
router.post("/trips/:tripId/entries", validateDiaryEntry, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Create diary entry endpoint - to be implemented",
  });
});

// PUT /api/diary/trips/:tripId/entries/:entryId
router.put(
  "/trips/:tripId/entries/:entryId",
  validateDiaryEntry,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Update diary entry endpoint - to be implemented",
    });
  }
);

// DELETE /api/diary/trips/:tripId/entries/:entryId
router.delete("/trips/:tripId/entries/:entryId", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Delete diary entry endpoint - to be implemented",
  });
});

// GET /api/diary/trips/:tripId/photos
router.get("/trips/:tripId/photos", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Get photos endpoint - to be implemented",
  });
});

// POST /api/diary/trips/:tripId/photos
router.post("/trips/:tripId/photos", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Upload photo endpoint - to be implemented",
  });
});

// DELETE /api/diary/trips/:tripId/photos/:photoId
router.delete("/trips/:tripId/photos/:photoId", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Delete photo endpoint - to be implemented",
  });
});

module.exports = router;
