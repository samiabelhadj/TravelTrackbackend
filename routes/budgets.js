const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/auth");
const budgetController = require("../controllers/budgetController");

const router = express.Router();

// @desc    Get all budgets for a trip
// @route   GET /api/trips/:tripId/budgets
// @access  Private
router.get("/", protect, budgetController.getBudgets);

// @desc    Get single budget
// @route   GET /api/trips/:tripId/budgets/:id
// @access  Private
router.get("/:id", protect, budgetController.getBudget);

// @desc    Create new budget
// @route   POST /api/trips/:tripId/budgets
// @access  Private
router.post(
  "/",
  protect,
  [
    body("title")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters"),
    body("totalBudget.amount")
      .isFloat({ min: 0 })
      .withMessage("Total budget must be a positive number"),
    body("totalBudget.currency")
      .isIn(["USD", "EUR", "GBP", "JPY", "CAD", "AUD"])
      .withMessage("Invalid currency"),
  ],
  budgetController.createBudget
);

// @desc    Update budget
// @route   PUT /api/trips/:tripId/budgets/:id
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
    body("totalBudget.amount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Total budget must be a positive number"),
    body("totalBudget.currency")
      .optional()
      .isIn(["USD", "EUR", "GBP", "JPY", "CAD", "AUD"])
      .withMessage("Invalid currency"),
  ],
  budgetController.updateBudget
);

// @desc    Delete budget
// @route   DELETE /api/trips/:tripId/budgets/:id
// @access  Private
router.delete("/:id", protect, budgetController.deleteBudget);

// @desc    Add item to budget
// @route   POST /api/trips/:tripId/budgets/:id/items
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
        "Accommodation",
        "Transportation",
        "Food",
        "Activities",
        "Shopping",
        "Other",
      ])
      .withMessage("Invalid category"),
    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("date")
      .optional()
      .isISO8601()
      .withMessage("Date must be a valid ISO date"),
  ],
  budgetController.addItem
);

// @desc    Update item in budget
// @route   PUT /api/trips/:tripId/budgets/:id/items/:itemId
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
        "Accommodation",
        "Transportation",
        "Food",
        "Activities",
        "Shopping",
        "Other",
      ])
      .withMessage("Invalid category"),
    body("amount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("date")
      .optional()
      .isISO8601()
      .withMessage("Date must be a valid ISO date"),
  ],
  budgetController.updateItem
);

// @desc    Delete item from budget
// @route   DELETE /api/trips/:tripId/budgets/:id/items/:itemId
// @access  Private
router.delete("/:id/items/:itemId", protect, budgetController.deleteItem);

// @desc    Toggle item paid status
// @route   PUT /api/trips/:tripId/budgets/:id/items/:itemId/toggle
// @access  Private
router.put(
  "/:id/items/:itemId/toggle",
  protect,
  budgetController.toggleItemPaid
);

// @desc    Add income to budget
// @route   POST /api/trips/:tripId/budgets/:id/income
// @access  Private
router.post(
  "/:id/income",
  protect,
  [
    body("description")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Description must be between 2 and 100 characters"),
    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("date")
      .optional()
      .isISO8601()
      .withMessage("Date must be a valid ISO date"),
  ],
  budgetController.addIncome
);

// @desc    Update income in budget
// @route   PUT /api/trips/:tripId/budgets/:id/income/:incomeId
// @access  Private
router.put(
  "/:id/income/:incomeId",
  protect,
  [
    body("description")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Description must be between 2 and 100 characters"),
    body("amount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("date")
      .optional()
      .isISO8601()
      .withMessage("Date must be a valid ISO date"),
  ],
  budgetController.updateIncome
);

// @desc    Delete income from budget
// @route   DELETE /api/trips/:tripId/budgets/:id/income/:incomeId
// @access  Private
router.delete("/:id/income/:incomeId", protect, budgetController.deleteIncome);

// @desc    Get budget statistics
// @route   GET /api/trips/:tripId/budgets/stats
// @access  Private
router.get("/stats", protect, budgetController.getBudgetStats);

module.exports = router;
