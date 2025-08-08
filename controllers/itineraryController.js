const Itinerary = require("../models/Itinerary");
const Trip = require("../models/Trip");
const { validationResult } = require("express-validator");

// Get all itineraries for a trip
exports.getItineraries = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to access this trip",
        });
    }
    const itineraries = await Itinerary.find({ trip: req.params.tripId }).sort(
      "dayNumber"
    );
    res
      .status(200)
      .json({ success: true, count: itineraries.length, data: itineraries });
  } catch (error) {
    next(error);
  }
};

// Get single itinerary
exports.getItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res
        .status(404)
        .json({ success: false, message: "Itinerary not found" });
    }
    const trip = await Trip.findById(itinerary.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to access this itinerary",
        });
    }
    res.status(200).json({ success: true, data: itinerary });
  } catch (error) {
    next(error);
  }
};

// Create new itinerary
exports.createItinerary = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to create itinerary for this trip",
        });
    }
    const existingItinerary = await Itinerary.findOne({
      trip: req.params.tripId,
      dayNumber: req.body.dayNumber,
    });
    if (existingItinerary) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Itinerary for this day already exists",
        });
    }
    const itinerary = await Itinerary.create({
      ...req.body,
      trip: req.params.tripId,
    });
    res
      .status(201)
      .json({
        success: true,
        message: "Itinerary created successfully!",
        data: itinerary,
      });
  } catch (error) {
    next(error);
  }
};

// Update itinerary
exports.updateItinerary = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res
        .status(404)
        .json({ success: false, message: "Itinerary not found" });
    }
    const trip = await Trip.findById(itinerary.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update this itinerary",
        });
    }
    const updatedItinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Itinerary updated successfully!",
        data: updatedItinerary,
      });
  } catch (error) {
    next(error);
  }
};

// Delete itinerary
exports.deleteItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res
        .status(404)
        .json({ success: false, message: "Itinerary not found" });
    }
    const trip = await Trip.findById(itinerary.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this itinerary",
        });
    }
    await itinerary.remove();
    res
      .status(200)
      .json({ success: true, message: "Itinerary deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

// Add activity to itinerary
exports.addActivity = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res
        .status(404)
        .json({ success: false, message: "Itinerary not found" });
    }
    const trip = await Trip.findById(itinerary.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to add activities to this itinerary",
        });
    }
    itinerary.activities.push(req.body);
    await itinerary.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Activity added successfully!",
        data: itinerary,
      });
  } catch (error) {
    next(error);
  }
};

// Update activity in itinerary
exports.updateActivity = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res
        .status(404)
        .json({ success: false, message: "Itinerary not found" });
    }
    const trip = await Trip.findById(itinerary.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update activities in this itinerary",
        });
    }
    const activityIndex = itinerary.activities.findIndex(
      (activity) => activity._id.toString() === req.params.activityId
    );
    if (activityIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }
    itinerary.activities[activityIndex] = {
      ...itinerary.activities[activityIndex].toObject(),
      ...req.body,
    };
    await itinerary.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Activity updated successfully!",
        data: itinerary,
      });
  } catch (error) {
    next(error);
  }
};

// Delete activity from itinerary
exports.deleteActivity = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res
        .status(404)
        .json({ success: false, message: "Itinerary not found" });
    }
    const trip = await Trip.findById(itinerary.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete activities from this itinerary",
        });
    }
    itinerary.activities = itinerary.activities.filter(
      (activity) => activity._id.toString() !== req.params.activityId
    );
    await itinerary.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Activity deleted successfully!",
        data: itinerary,
      });
  } catch (error) {
    next(error);
  }
};

// Reorder activities in itinerary
exports.reorderActivities = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { activityIds } = req.body;
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res
        .status(404)
        .json({ success: false, message: "Itinerary not found" });
    }
    const trip = await Trip.findById(itinerary.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to reorder activities in this itinerary",
        });
    }
    const reorderedActivities = [];
    for (const activityId of activityIds) {
      const activity = itinerary.activities.find(
        (a) => a._id.toString() === activityId
      );
      if (activity) {
        reorderedActivities.push(activity);
      }
    }
    itinerary.activities = reorderedActivities;
    await itinerary.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Activities reordered successfully!",
        data: itinerary,
      });
  } catch (error) {
    next(error);
  }
};

// Toggle activity completion
exports.toggleActivityCompletion = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res
        .status(404)
        .json({ success: false, message: "Itinerary not found" });
    }
    const trip = await Trip.findById(itinerary.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update activities in this itinerary",
        });
    }
    const activityIndex = itinerary.activities.findIndex(
      (activity) => activity._id.toString() === req.params.activityId
    );
    if (activityIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }
    itinerary.activities[activityIndex].isCompleted =
      !itinerary.activities[activityIndex].isCompleted;
    await itinerary.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Activity completion toggled successfully!",
        data: itinerary,
      });
  } catch (error) {
    next(error);
  }
};

// Get itinerary statistics
exports.getItineraryStats = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to access this trip",
        });
    }
    const itineraries = await Itinerary.find({ trip: req.params.tripId });
    const totalActivities = itineraries.reduce(
      (sum, itinerary) => sum + itinerary.activities.length,
      0
    );
    const completedActivities = itineraries.reduce(
      (sum, itinerary) =>
        sum +
        itinerary.activities.filter((activity) => activity.isCompleted).length,
      0
    );
    const totalCost = itineraries.reduce(
      (sum, itinerary) => sum + itinerary.totalCost,
      0
    );
    const totalDuration = itineraries.reduce(
      (sum, itinerary) => sum + itinerary.totalDuration,
      0
    );
    const stats = {
      totalDays: itineraries.length,
      totalActivities,
      completedActivities,
      completionRate:
        totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0,
      totalCost,
      totalDuration,
    };
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
