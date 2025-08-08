const Trip = require("../models/Trip");
const Destination = require("../models/Destination");
const User = require("../models/User");
const { validationResult } = require("express-validator");

// Get all trips for logged in user
exports.getAllTrips = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Trip.countDocuments({ user: req.user.id });
    let query = Trip.find({ user: req.user.id }).populate(
      "destination",
      "name city country mainImage"
    );
    if (req.query.status)
      query = query.where("status").equals(req.query.status);
    if (req.query.type) query = query.where("type").equals(req.query.type);
    if (req.query.search)
      query = query.where("title").regex(new RegExp(req.query.search, "i"));
    if (req.query.sort) {
      const sortOrder = req.query.order === "desc" ? -1 : 1;
      query = query.sort({ [req.query.sort]: sortOrder });
    } else {
      query = query.sort("-createdAt");
    }
    const trips = await query.skip(startIndex).limit(limit);
    const pagination = {};
    if (endIndex < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };
    res
      .status(200)
      .json({ success: true, count: trips.length, pagination, data: trips });
  } catch (error) {
    next(error);
  }
};

// Get single trip
exports.getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate(
        "destination",
        "name city country description images coordinates"
      )
      .populate("collaborators.user", "firstName lastName email avatar");
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user._id.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to access this trip",
        });
    }
    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

// Create new trip
exports.createTrip = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const {
      title,
      description,
      destination,
      startDate,
      endDate,
      type,
      budget,
      tags,
    } = req.body;
    const destinationExists = await Destination.findById(destination);
    if (!destinationExists) {
      return res
        .status(404)
        .json({ success: false, message: "Destination not found" });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res
        .status(400)
        .json({ success: false, message: "End date must be after start date" });
    }
    if (start < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Start date cannot be in the past" });
    }
    const trip = await Trip.create({
      title,
      description,
      user: req.user.id,
      destination,
      startDate: start,
      endDate: end,
      type: type || "Solo",
      budget: {
        total: budget?.total || 0,
        currency: budget?.currency || "USD",
      },
      tags: tags || [],
    });
    const populatedTrip = await Trip.findById(trip._id).populate(
      "destination",
      "name city country mainImage"
    );
    res
      .status(201)
      .json({
        success: true,
        message: "Trip created successfully!",
        data: populatedTrip,
      });
  } catch (error) {
    next(error);
  }
};

// Update trip
exports.updateTrip = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    let trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }
    if (trip.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update this trip",
        });
    }
    if (req.body.startDate && req.body.endDate) {
      const start = new Date(req.body.startDate);
      const end = new Date(req.body.endDate);
      if (start >= end) {
        return res
          .status(400)
          .json({
            success: false,
            message: "End date must be after start date",
          });
      }
    }
    if (req.body.destination) {
      const destinationExists = await Destination.findById(
        req.body.destination
      );
      if (!destinationExists) {
        return res
          .status(404)
          .json({ success: false, message: "Destination not found" });
      }
    }
    trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("destination", "name city country mainImage");
    res
      .status(200)
      .json({
        success: true,
        message: "Trip updated successfully!",
        data: trip,
      });
  } catch (error) {
    next(error);
  }
};

// Delete trip
exports.deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }
    if (trip.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this trip",
        });
    }
    await trip.remove();
    res
      .status(200)
      .json({ success: true, message: "Trip deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

// Get trip statistics
exports.getTripStats = async (req, res, next) => {
  try {
    const stats = await Trip.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalBudget: { $sum: "$budget.total" },
          totalSpent: { $sum: "$budget.spent" },
          avgDuration: { $avg: "$duration" },
        },
      },
    ]);
    const statusStats = await Trip.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const typeStats = await Trip.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);
    res
      .status(200)
      .json({
        success: true,
        data: {
          overview: stats[0] || {
            totalTrips: 0,
            totalBudget: 0,
            totalSpent: 0,
            avgDuration: 0,
          },
          statusBreakdown: statusStats,
          typeBreakdown: typeStats,
        },
      });
  } catch (error) {
    next(error);
  }
};

// Add collaborator to trip
exports.addCollaborator = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }
    if (trip.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to add collaborators to this trip",
        });
    }
    const collaborator = await User.findOne({ email: req.body.email });
    if (!collaborator) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const existingCollaborator = trip.collaborators.find(
      (collab) => collab.user.toString() === collaborator._id.toString()
    );
    if (existingCollaborator) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User is already a collaborator on this trip",
        });
    }
    trip.collaborators.push({
      user: collaborator._id,
      role: req.body.role || "Viewer",
    });
    await trip.save();
    const populatedTrip = await Trip.findById(trip._id).populate(
      "collaborators.user",
      "firstName lastName email avatar"
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Collaborator added successfully!",
        data: populatedTrip,
      });
  } catch (error) {
    next(error);
  }
};

// Remove collaborator from trip
exports.removeCollaborator = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }
    if (trip.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to remove collaborators from this trip",
        });
    }
    trip.collaborators = trip.collaborators.filter(
      (collab) => collab._id.toString() !== req.params.collaboratorId
    );
    await trip.save();
    const populatedTrip = await Trip.findById(trip._id).populate(
      "collaborators.user",
      "firstName lastName email avatar"
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Collaborator removed successfully!",
        data: populatedTrip,
      });
  } catch (error) {
    next(error);
  }
};
