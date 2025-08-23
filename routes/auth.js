const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/auth");
const authController = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  [
    body("firstName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("lastName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  ],
  authController.register
);

router.post(
  "/verify-email",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("code")
      .isLength({ min: 6, max: 6 })
      .withMessage("Verification code must be 6 digits")
      .isNumeric()
      .withMessage("Verification code must contain only numbers"),
  ],
  authController.verifyEmail
);

router.post(
  "/resend-verification",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
  ],
  authController.resendVerification
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authController.login
);

router.post("/logout", protect, authController.logout);

router.get("/me", protect, authController.getMe);

router.post(
  "/forgotpassword",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
  ],
  authController.forgotPassword
);
router.post(
  "/verify-reset-code",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("code")
      .isLength({ min: 6, max: 6 })
      .withMessage("Reset code must be 6 digits")
      .isNumeric()
      .withMessage("Reset code must contain only numbers"),
  ],
  authController.verifyResetCode
);
router.put("/resetpassword",authController.resetPassword);

//router.put(
"/resetpassword",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("code")
      .isLength({ min: 6, max: 6 })
      .withMessage("Reset code must be 6 digits")
      .isNumeric()
      .withMessage("Reset code must contain only numbers"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  ],
  authController.resetPassword;
//);

router.put(
  "/updatedetails",
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
  authController.updateDetails
);

router.put(
  "/updatepassword",
  protect,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "New password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  ],
  authController.updatePassword
);

module.exports = router;
