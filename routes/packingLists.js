const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/auth");
const packingListController = require("../controllers/packingListController");

const router = express.Router();

// @desc    Get all packing lists for a trip
// @route   GET /api/trips/:tripId/packing-lists
// @access  Private
router.get("/", protect, packingListController.getPackingLists);

// @desc    Get single packing list
// @route   GET /api/trips/:tripId/packing-lists/:id
// @access  Private
router.get("/:id", protect, packingListController.getPackingList);

// @desc    Create new packing list
// @route   POST /api/trips/:tripId/packing-lists
// @access  Private
router.post(
  "/",
  protect,
  [
    body("title")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters"),
  ],
  packingListController.createPackingList
);

// @desc    Update packing list
// @route   PUT /api/trips/:tripId/packing-lists/:id
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
  ],
  packingListController.updatePackingList
);

// @desc    Delete packing list
// @route   DELETE /api/trips/:tripId/packing-lists/:id
// @access  Private
router.delete("/:id", protect, packingListController.deletePackingList);

// @desc    Add item to packing list
// @route   POST /api/trips/:tripId/packing-lists/:id/items
// @access  Private
router.post(
  "/:id/items",
  protect,
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Item name must be between 2 and 100 characters"),
    body("category")
      .isIn([
        "Clothing",
        "Electronics",
        "Toiletries",
        "Documents",
        "Accessories",
        "Other",
      ])
      .withMessage("Invalid category"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("weight")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Weight must be a positive number"),
    body("estimatedCost")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Estimated cost must be a positive number"),
  ],
  packingListController.addItem
);

// @desc    Update item in packing list
// @route   PUT /api/trips/:tripId/packing-lists/:id/items/:itemId
// @access  Private
router.put(
  "/:id/items/:itemId",
  protect,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Item name must be between 2 and 100 characters"),
    body("category")
      .optional()
      .isIn([
        "Clothing",
        "Electronics",
        "Toiletries",
        "Documents",
        "Accessories",
        "Other",
      ])
      .withMessage("Invalid category"),
    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("weight")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Weight must be a positive number"),
    body("estimatedCost")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Estimated cost must be a positive number"),
  ],
  packingListController.updateItem
);

// @desc    Delete item from packing list
// @route   DELETE /api/trips/:tripId/packing-lists/:id/items/:itemId
// @access  Private
router.delete("/:id/items/:itemId", protect, packingListController.deleteItem);

// @desc    Toggle item packed status
// @route   PUT /api/trips/:tripId/packing-lists/:id/items/:itemId/toggle
// @access  Private
router.put(
  "/:id/items/:itemId/toggle",
  protect,
  packingListController.toggleItemPacked
);

// @desc    Generate packing list from template
// @route   POST /api/trips/:tripId/packing-lists/generate
// @access  Private
router.post(
  "/generate",
  protect,
  [
    body("template")
      .isIn(["beach", "mountain", "city", "business"])
      .withMessage("Invalid template"),
    body("destination")
      .optional()
      .isString()
      .withMessage("Destination must be a string"),
    body("duration")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Duration must be a positive integer"),
    body("season")
      .optional()
      .isIn(["spring", "summer", "autumn", "winter"])
      .withMessage("Invalid season"),
  ],
  packingListController.generateFromTemplate
);

// @desc    Get packing list statistics
// @route   GET /api/trips/:tripId/packing-lists/stats
// @access  Private
router.get("/stats", protect, packingListController.getPackingListStats);

module.exports = router;
