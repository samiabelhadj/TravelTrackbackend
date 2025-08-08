const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Activity title is required"],
      trim: true,
      maxlength: [100, "Activity title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    type: {
      type: String,
      enum: [
        "Attraction",
        "Restaurant",
        "Hotel",
        "Transport",
        "Activity",
        "Shopping",
        "Entertainment",
        "Custom",
      ],
      required: true,
    },
    location: {
      name: {
        type: String,
        required: true,
      },
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    cost: {
      amount: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    bookingInfo: {
      confirmationNumber: String,
      provider: String,
      contact: String,
      notes: String,
    },
    images: [
      {
        public_id: String,
        url: String,
        caption: String,
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const daySchema = new mongoose.Schema(
  {
    dayNumber: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      maxlength: [100, "Day title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Day description cannot exceed 500 characters"],
    },
    activities: [activitySchema],
    notes: {
      type: String,
      maxlength: [1000, "Day notes cannot exceed 1000 characters"],
    },
    weather: {
      temperature: {
        min: Number,
        max: Number,
      },
      condition: String,
      icon: String,
    },
  },
  {
    timestamps: true,
  }
);

const itinerarySchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Itinerary title is required"],
      trim: true,
      maxlength: [100, "Itinerary title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    days: [daySchema],
    totalCost: {
      amount: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    totalDuration: {
      type: Number, // in days
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    version: {
      type: Number,
      default: 1,
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    templateCategory: {
      type: String,
      enum: [
        "Adventure",
        "Relaxation",
        "Cultural",
        "Food",
        "Family",
        "Romantic",
        "Business",
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total cost before saving
itinerarySchema.pre("save", function (next) {
  let totalCost = 0;
  this.days.forEach((day) => {
    day.activities.forEach((activity) => {
      totalCost += activity.cost.amount || 0;
    });
  });
  this.totalCost.amount = totalCost;
  this.totalDuration = this.days.length;
  next();
});

// Virtual for total activities count
itinerarySchema.virtual("totalActivities").get(function () {
  return this.days.reduce((total, day) => total + day.activities.length, 0);
});

// Virtual for completed activities count
itinerarySchema.virtual("completedActivities").get(function () {
  return this.days.reduce((total, day) => {
    return (
      total + day.activities.filter((activity) => activity.isCompleted).length
    );
  }, 0);
});

// Virtual for completion percentage
itinerarySchema.virtual("completionPercentage").get(function () {
  const total = this.totalActivities;
  const completed = this.completedActivities;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
});

// Ensure virtual fields are serialized
itinerarySchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Itinerary", itinerarySchema);
