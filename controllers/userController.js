const User = require("../models/User");
const { validationResult } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");

// Get user profile
exports.getProfile = async (req, res, next) => {
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

// Update user profile
exports.updateProfile = async (req, res, next) => {
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
      message: "Profile updated successfully!",
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

// Update user preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { currency, language, timezone, notifications } = req.body;
    const preferencesToUpdate = {};
    if (currency) preferencesToUpdate["preferences.currency"] = currency;
    if (language) preferencesToUpdate["preferences.language"] = language;
    if (timezone) preferencesToUpdate["preferences.timezone"] = timezone;
    if (notifications) {
      if (notifications.email !== undefined)
        preferencesToUpdate["preferences.notifications.email"] =
          notifications.email;
      if (notifications.push !== undefined)
        preferencesToUpdate["preferences.notifications.push"] =
          notifications.push;
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      preferencesToUpdate,
      { new: true, runValidators: true }
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Preferences updated successfully!",
        data: { preferences: user.preferences },
      });
  } catch (error) {
    next(error);
  }
};

// Upload user avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    const { avatarUrl, publicId } = req.body;
    if (!avatarUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide avatar URL" });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: { public_id: publicId || null, url: avatarUrl } },
      { new: true }
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Avatar updated successfully!",
        data: { avatar: user.avatar },
      });
  } catch (error) {
    next(error);
  }
};

// Delete user account
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    await user.remove();
    res
      .status(200)
      .json({ success: true, message: "Account deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

// Get user statistics
exports.getStats = async (req, res, next) => {
  try {
    const Trip = require("../models/Trip");
    const Itinerary = require("../models/Itinerary");
    const PackingList = require("../models/PackingList");
    const Budget = require("../models/Budget");
    const tripStats = await Trip.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          completedTrips: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
          },
          activeTrips: {
            $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
          },
          planningTrips: {
            $sum: { $cond: [{ $eq: ["$status", "Planning"] }, 1, 0] },
          },
          totalDays: { $sum: "$duration" },
          totalBudget: { $sum: "$budget.total" },
        },
      },
    ]);
    const itineraryStats = await Itinerary.aggregate([
      {
        $lookup: {
          from: "trips",
          localField: "trip",
          foreignField: "_id",
          as: "trip",
        },
      },
      { $unwind: "$trip" },
      { $match: { "trip.user": req.user._id } },
      {
        $group: {
          _id: null,
          totalItineraries: { $sum: 1 },
          totalActivities: { $sum: "$totalActivities" },
          completedActivities: { $sum: "$completedActivities" },
        },
      },
    ]);
    const packingListStats = await PackingList.aggregate([
      {
        $lookup: {
          from: "trips",
          localField: "trip",
          foreignField: "_id",
          as: "trip",
        },
      },
      { $unwind: "$trip" },
      { $match: { "trip.user": req.user._id } },
      {
        $group: {
          _id: null,
          totalPackingLists: { $sum: 1 },
          totalItems: { $sum: "$totalItems" },
          packedItems: { $sum: "$packedItems" },
        },
      },
    ]);
    const budgetStats = await Budget.aggregate([
      {
        $lookup: {
          from: "trips",
          localField: "trip",
          foreignField: "_id",
          as: "trip",
        },
      },
      { $unwind: "$trip" },
      { $match: { "trip.user": req.user._id } },
      {
        $group: {
          _id: null,
          totalBudgets: { $sum: 1 },
          totalBudgetAmount: { $sum: "$totalBudget.amount" },
          totalExpenses: { $sum: "$totalExpenses.amount" },
          totalIncome: { $sum: "$totalIncome.amount" },
        },
      },
    ]);
    const recentTrips = await Trip.find({ user: req.user._id })
      .sort("-createdAt")
      .limit(5)
      .select("title destination startDate endDate status");
    const stats = {
      trips: tripStats[0] || {
        totalTrips: 0,
        completedTrips: 0,
        activeTrips: 0,
        planningTrips: 0,
        totalDays: 0,
        totalBudget: 0,
      },
      itineraries: itineraryStats[0] || {
        totalItineraries: 0,
        totalActivities: 0,
        completedActivities: 0,
      },
      packingLists: packingListStats[0] || {
        totalPackingLists: 0,
        totalItems: 0,
        packedItems: 0,
      },
      budgets: budgetStats[0] || {
        totalBudgets: 0,
        totalBudgetAmount: 0,
        totalExpenses: 0,
        totalIncome: 0,
      },
      recentActivity: { trips: recentTrips },
    };
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await User.countDocuments();
    const users = await User.find()
      .select("-password")
      .skip(startIndex)
      .limit(limit)
      .sort("-createdAt");
    const pagination = {};
    if (endIndex < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };
    res
      .status(200)
      .json({ success: true, count: users.length, pagination, data: users });
  } catch (error) {
    next(error);
  }
};

// Admin: Get single user
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Admin: Update user
exports.updateUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "User updated successfully!",
        data: user,
      });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    await user.remove();
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully!" });
  } catch (error) {
    next(error);
  }
};
