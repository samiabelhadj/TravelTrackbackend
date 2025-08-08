const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/auth");
const {
  uploadSingleImage,
  uploadMultipleImages,
  processImageUpload,
  processMultipleImageUploads,
} = require("../middleware/upload");
const destinationController = require("../controllers/destinationController");

const router = express.Router();

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
router.get("/", destinationController.getAllDestinations);

// @desc    Create destination
// @route   POST /api/destinations
// @access  Private (Admin)
router.post(
  "/",
  protect,
  uploadSingleImage,
  processImageUpload,
  [
    body("name")
      .notEmpty()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),
    body("country").notEmpty().trim().withMessage("Country is required"),
    body("city").notEmpty().trim().withMessage("City is required"),
    body("description")
      .notEmpty()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage("Description must be between 10 and 2000 characters"),
    body("categories")
      .isArray({ min: 1 })
      .withMessage("At least one category is required"),
    body("coordinates.latitude")
      .isFloat({ min: -90, max: 90 })
      .withMessage("Valid latitude is required"),
    body("coordinates.longitude")
      .isFloat({ min: -180, max: 180 })
      .withMessage("Valid longitude is required"),
  ],
  destinationController.createDestination
);

// @desc    Get single destination
// @route   GET /api/destinations/:id
// @access  Public
router.get("/:id", destinationController.getDestination);

// @desc    Update destination
// @route   PUT /api/destinations/:id
// @access  Private (Admin)
router.put(
  "/:id",
  protect,
  uploadSingleImage,
  processImageUpload,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage("Description must be between 10 and 2000 characters"),
  ],
  destinationController.updateDestination
);

// @desc    Delete destination
// @route   DELETE /api/destinations/:id
// @access  Private (Admin)
router.delete("/:id", protect, destinationController.deleteDestination);

// @desc    Upload multiple images to destination
// @route   POST /api/destinations/:id/images
// @access  Private (Admin)
router.post(
  "/:id/images",
  protect,
  uploadMultipleImages,
  processMultipleImageUploads,
  destinationController.uploadDestinationImages
);

// @desc    Get featured destinations
// @route   GET /api/destinations/featured
// @access  Public
router.get("/featured", destinationController.getFeaturedDestinations);

// @desc    Get popular destinations
// @route   GET /api/destinations/popular
// @access  Public
router.get("/popular", destinationController.getPopularDestinations);

// @desc    Search destinations
// @route   GET /api/destinations/search
// @access  Public
router.get("/search", destinationController.searchDestinations);

// @desc    Get destinations by category
// @route   GET /api/destinations/category/:category
// @access  Public
router.get(
  "/category/:category",
  destinationController.getDestinationsByCategory
);

// @desc    Get destinations by country
// @route   GET /api/destinations/country/:country
// @access  Public
router.get("/country/:country", destinationController.getDestinationsByCountry);

// @desc    Get available categories
// @route   GET /api/destinations/categories
// @access  Public
router.get("/categories", destinationController.getCategories);

// @desc    Get available countries
// @route   GET /api/destinations/countries
// @access  Public
router.get("/countries", destinationController.getCountries);

// @desc    Increment visit count
// @route   PUT /api/destinations/:id/visit
// @access  Public
router.put("/:id/visit", destinationController.incrementVisitCount);

// @desc    Add destination rating
// @route   POST /api/destinations/:id/rating
// @access  Private
router.post(
  "/:id/rating",
  [
    body("rating")
      .isFloat({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("review")
      .optional()
      .isLength({ min: 10, max: 500 })
      .withMessage("Review must be between 10 and 500 characters"),
  ],
  destinationController.addRating
);

// @desc    Get destination reviews
// @route   GET /api/destinations/:id/reviews
// @access  Public
router.get("/:id/reviews", destinationController.getDestinationReviews);

// @desc    Add review
// @route   POST /api/destinations/:id/reviews
// @access  Private
router.post(
  "/:id/reviews",
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("title")
      .isLength({ min: 5, max: 100 })
      .withMessage("Review title must be between 5 and 100 characters"),
    body("comment")
      .isLength({ min: 10, max: 1000 })
      .withMessage("Review comment must be between 10 and 1000 characters"),
  ],
  destinationController.addReview
);

// @desc    Update review
// @route   PUT /api/destinations/:id/reviews/:reviewId
// @access  Private
router.put(
  "/:id/reviews/:reviewId",
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("title")
      .isLength({ min: 5, max: 100 })
      .withMessage("Review title must be between 5 and 100 characters"),
    body("comment")
      .isLength({ min: 10, max: 1000 })
      .withMessage("Review comment must be between 10 and 1000 characters"),
  ],
  destinationController.updateReview
);

// @desc    Delete review
// @route   DELETE /api/destinations/:id/reviews/:reviewId
// @access  Private
router.delete("/:id/reviews/:reviewId", destinationController.deleteReview);

// @desc    Toggle review helpful
// @route   PUT /api/destinations/:id/reviews/:reviewId/helpful
// @access  Private
router.put(
  "/:id/reviews/:reviewId/helpful",
  destinationController.toggleReviewHelpful
);

module.exports = router;
