const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/auth");
const tripController = require("../controllers/tripController");

const router = express.Router();

// @desc    Get all trips for logged in user
// @route   GET /api/trips
// @access  Private
router.get("/", protect, tripController.getAllTrips);

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
router.get("/:id", protect, tripController.getTrip);

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private
router.post(
  "/",
  protect,
  [
    body("title")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters"),
    body("destination")
      .isMongoId()
      .withMessage("Please provide a valid destination ID"),
    body("startDate")
      .isISO8601()
      .withMessage("Please provide a valid start date"),
    body("endDate").isISO8601().withMessage("Please provide a valid end date"),
    body("type")
      .optional()
      .isIn(["Solo", "Couple", "Family", "Group", "Business"])
      .withMessage("Invalid trip type"),
  ],
  tripController.createTrip
);

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
router.put(
  "/:id",
  protect,
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters"),
    body("destination")
      .optional()
      .isMongoId()
      .withMessage("Please provide a valid destination ID"),
    body("startDate")
      .optional()
      .isISO8601()
      .withMessage("Please provide a valid start date"),
    body("endDate")
      .optional()
      .isISO8601()
      .withMessage("Please provide a valid end date"),
    body("type")
      .optional()
      .isIn(["Solo", "Couple", "Family", "Group", "Business"])
      .withMessage("Invalid trip type"),
    body("status")
      .optional()
      .isIn(["Planning", "Active", "Completed", "Cancelled"])
      .withMessage("Invalid status"),
  ],
  tripController.updateTrip
);

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
router.delete("/:id", protect, tripController.deleteTrip);

// @desc    Get trip statistics
// @route   GET /api/trips/stats/overview
// @access  Private
router.get("/stats/overview", protect, tripController.getTripStats);

// @desc    Add collaborator to trip
// @route   POST /api/trips/:id/collaborators
// @access  Private
router.post(
  "/:id/collaborators",
  protect,
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("role")
      .optional()
      .isIn(["Viewer", "Editor", "Admin"])
      .withMessage("Invalid role"),
  ],
  tripController.addCollaborator
);

// @desc    Remove collaborator from trip
// @route   DELETE /api/trips/:id/collaborators/:collaboratorId
// @access  Private
router.delete(
  "/:id/collaborators/:collaboratorId",
  protect,
  tripController.removeCollaborator
);

module.exports = router;
 