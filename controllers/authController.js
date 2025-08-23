// Authentication Controller for TRAVELTRACK
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { sendEmail, emailTemplates } = require("../utils/sendEmail");
const ErrorResponse = require("../utils/errorResponse");

// Register user
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { firstName, lastName, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }
    const user = await User.create({ firstName, lastName, email, password });
    const verificationCode = user.getEmailVerificationCode();
    await user.save();
    try {
      const emailOptions = emailTemplates.verificationEmail(
        user,
        verificationCode
      );
      await sendEmail({
        email: user.email,
        subject: emailOptions.subject,
        html: emailOptions.html,
      });
      res.status(201).json({
        success: true,
        message:
          "Registration successful! Please check your email to verify your account.",
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
          },
        },
      });
    } catch (error) {
      console.error("Email sending failed:", error);
      res.status(201).json({
        success: true,
        message:
          "Registration successful! However, verification email could not be sent. Please contact support.",
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
          },
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// Verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    const user = await User.findOne({
      email,
      emailVerificationCode: code,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      message:
        "Email verified successfully! You can now log in to your account.",
    });
  } catch (error) {
    next(error);
  }
};

// Resend verification email
exports.resendVerification = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.isEmailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already verified" });
    }
    const verificationCode = user.getEmailVerificationCode();
    await user.save();
    try {
      const emailOptions = emailTemplates.verificationEmail(
        user,
        verificationCode
      );
      await sendEmail({
        email: user.email,
        subject: emailOptions.subject,
        html: emailOptions.html,
      });
      res.status(200).json({
        success: true,
        message: "Verification email sent successfully!",
      });
    } catch (error) {
      console.error("Email sending failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again later.",
      });
    }
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email address before logging in",
      });
    }
    user.lastLogin = new Date();
    await user.save();
    const token = user.getSignedJwtToken();
    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };
    res
      .status(200)
      .cookie("token", token, options)
      .json({
        success: true,
        message: "Login successful!",
        token,
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified,
            role: user.role,
            preferences: user.preferences,
          },
        },
      });
  } catch (error) {
    next(error);
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  try {
    res
      .status(200)
      .cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
      })
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// Get current logged in user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          role: user.role,
          preferences: user.preferences,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const resetCode = user.getResetPasswordCode();
    await user.save();
    const emailOptions = emailTemplates.passwordResetEmail(user, resetCode);
    try {
      await sendEmail({
        email: user.email,
        subject: emailOptions.subject,
        html: emailOptions.html,
      });
      res.status(200).json({
        success: true,
        message: "Password reset code sent to your email!",
      });
    } catch (error) {
      console.error("Email sending failed:", error);
      user.resetPasswordCode = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset code. Please try again later.",
      });
    }
  } catch (error) {
    next(error);
  }
};
exports.verifyResetCode = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and reset code are required",
      });
    }

    // Find user with valid reset code
    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }
    // Generate a temporary reset token (valid for password reset)
    const crypto = require("crypto");
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes to set password
    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpire = resetTokenExpire;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Reset code verified successfully",
      resetToken: resetToken,
    });
  } catch (error) {
    next(error);
  }
};
exports.resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { password, resetToken } = req.body;

    if (!password || !resetToken) {
      return res.status(400).json({
        success: false,
        message: "New password and reset token are required",
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired reset session. Please start the reset process again.",
      });
    }

    // Update password and clear all reset fields
    user.password = password;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successful! You can now log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

// Update user details
exports.updateDetails = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    };
    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      message: "User details updated successfully!",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          role: user.role,
          preferences: user.preferences,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update password
exports.updatePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const user = await User.findById(req.user.id).select("+password");
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }
    user.password = req.body.newPassword;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    next(error);
  }
};
