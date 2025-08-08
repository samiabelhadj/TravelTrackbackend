const express = require("express");
const { body } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const userController = require("../controllers/userController");

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get("/profile", protect, userController.getProfile);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put(
  "/profile",
  protect,
  [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
  ],
  userController.updateProfile
);

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
router.put(
  "/preferences",
  protect,
  [
    body("currency")
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage("Currency must be 3 characters"),
    body("language")
      .optional()
      .isLength({ min: 2, max: 5 })
      .withMessage("Language must be between 2 and 5 characters"),
    body("timezone")
      .optional()
      .isLength({ min: 3, max: 50 })
      .withMessage("Timezone must be between 3 and 50 characters"),
  ],
  userController.updatePreferences
);

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
router.post("/avatar", protect, userController.uploadAvatar);

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
router.delete("/account", protect, userController.deleteAccount);

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get("/stats", protect, userController.getStats);

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get("/", protect, authorize("admin"), userController.getAllUsers);

// @desc    Get single user (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
router.get("/:id", protect, authorize("admin"), userController.getUser);

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put(
  "/:id",
  protect,
  authorize("admin"),
  [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("role").optional().isIn(["user", "admin"]).withMessage("Invalid role"),
  ],
  userController.updateUser
);

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete("/:id", protect, authorize("admin"), userController.deleteUser);

module.exports = router;
 