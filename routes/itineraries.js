const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/auth");
const itineraryController = require("../controllers/itineraryController");

const router = express.Router();

// @desc    Get all itineraries for a trip
// @route   GET /api/trips/:tripId/itineraries
// @access  Private
router.get("/", protect, itineraryController.getItineraries);

// @desc    Get single itinerary
// @route   GET /api/trips/:tripId/itineraries/:id
// @access  Private
router.get("/:id", protect, itineraryController.getItinerary);

// @desc    Create new itinerary
// @route   POST /api/trips/:tripId/itineraries
// @access  Private
router.post(
  "/",
  protect,
  [
    body("dayNumber")
      .isInt({ min: 1 })
      .withMessage("Day number must be a positive integer"),
    body("title")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters"),
  ],
  itineraryController.createItinerary
);

// @desc    Update itinerary
// @route   PUT /api/trips/:tripId/itineraries/:id
// @access  Private
router.put(
  "/:id",
  protect,
  [
    body("dayNumber")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Day number must be a positive integer"),
    body("title")
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters"),
  ],
  itineraryController.updateItinerary
);

// @desc    Delete itinerary
// @route   DELETE /api/trips/:tripId/itineraries/:id
// @access  Private
router.delete("/:id", protect, itineraryController.deleteItinerary);

// @desc    Add activity to itinerary
// @route   POST /api/trips/:tripId/itineraries/:id/activities
// @access  Private
router.post(
  "/:id/activities",
  protect,
  [
    body("name")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Activity name must be between 3 and 100 characters"),
    body("type")
      .isIn(["Attraction", "Restaurant", "Hotel", "Transport", "Other"])
      .withMessage("Invalid activity type"),
    body("startTime")
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Start time must be in HH:MM format"),
    body("endTime")
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("End time must be in HH:MM format"),
    body("cost")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Cost must be a positive number"),
  ],
  itineraryController.addActivity
);

// @desc    Update activity in itinerary
// @route   PUT /api/trips/:tripId/itineraries/:id/activities/:activityId
// @access  Private
router.put(
  "/:id/activities/:activityId",
  protect,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Activity name must be between 3 and 100 characters"),
    body("type")
      .optional()
      .isIn(["Attraction", "Restaurant", "Hotel", "Transport", "Other"])
      .withMessage("Invalid activity type"),
    body("startTime")
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Start time must be in HH:MM format"),
    body("endTime")
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("End time must be in HH:MM format"),
    body("cost")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Cost must be a positive number"),
  ],
  itineraryController.updateActivity
);

// @desc    Delete activity from itinerary
// @route   DELETE /api/trips/:tripId/itineraries/:id/activities/:activityId
// @access  Private
router.delete(
  "/:id/activities/:activityId",
  protect,
  itineraryController.deleteActivity
);

// @desc    Reorder activities in itinerary
// @route   PUT /api/trips/:tripId/itineraries/:id/activities/reorder
// @access  Private
router.put(
  "/:id/activities/reorder",
  protect,
  [
    body("activityIds")
      .isArray({ min: 1 })
      .withMessage("Activity IDs must be an array"),
  ],
  itineraryController.reorderActivities
);

// @desc    Toggle activity completion
// @route   PUT /api/trips/:tripId/itineraries/:id/activities/:activityId/toggle
// @access  Private
router.put(
  "/:id/activities/:activityId/toggle",
  protect,
  itineraryController.toggleActivityCompletion
);

// @desc    Get itinerary statistics
// @route   GET /api/trips/:tripId/itineraries/stats
// @access  Private
router.get("/stats", protect, itineraryController.getItineraryStats);

module.exports = router;
 