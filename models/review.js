const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.ObjectId,
      ref: "Destination",
    },
    activity: {
      type: mongoose.Schema.ObjectId,
      ref: "Activity",
    },
    trip: {
      type: mongoose.Schema.ObjectId,
      ref: "Trip",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "La note est obligatoire"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, "Le titre est obligatoire"],
      trim: true,
      maxlength: [100, "Le titre ne peut pas dépasser 100 caractères"],
    },
    comment: {
      type: String,
      required: [true, "Le commentaire est obligatoire"],
      maxlength: [1000, "Le commentaire ne peut pas dépasser 1000 caractères"],
    },
    pros: [String],
    cons: [String],
    tips: [String],
    photos: [String],
    visitDate: Date,
    wouldRecommend: {
      type: Boolean,
      default: true,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    reportedCount: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    moderatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    moderationNote: String,
  },
  {
    timestamps: true,
  }
);

// Un utilisateur ne peut faire qu'un seul avis par destination/activité
reviewSchema.index({ user: 1, destination: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, activity: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Review", reviewSchema);
