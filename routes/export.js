const express = require("express");
const router = express.Router();

// Import controllers (to be created)
// const exportController = require("../controllers/exportController");

// Routes
// GET /api/export/trips/:tripId/itinerary/pdf
router.get("/trips/:tripId/itinerary/pdf", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Export itinerary as PDF endpoint - to be implemented",
  });
});

// GET /api/export/trips/:tripId/itinerary/share
router.get("/trips/:tripId/itinerary/share", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Share itinerary endpoint - to be implemented",
  });
});

// GET /api/export/trips/:tripId/packing-list/pdf
router.get("/trips/:tripId/packing-list/pdf", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Export packing list as PDF endpoint - to be implemented",
  });
});

// GET /api/export/trips/:tripId/budget/pdf
router.get("/trips/:tripId/budget/pdf", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Export budget as PDF endpoint - to be implemented",
  });
});

// GET /api/export/trips/:tripId/complete-package/pdf
router.get("/trips/:tripId/complete-package/pdf", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Export complete trip package as PDF endpoint - to be implemented",
  });
});

module.exports = router;
