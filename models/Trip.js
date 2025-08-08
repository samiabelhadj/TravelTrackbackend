const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Trip title is required"],
      trim: true,
      maxlength: [100, "Trip title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    duration: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Planning", "Active", "Completed", "Cancelled"],
      default: "Planning",
    },
    type: {
      type: String,
      enum: ["Solo", "Couple", "Family", "Group", "Business"],
      default: "Solo",
    },
    budget: {
      total: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
      spent: {
        type: Number,
        default: 0,
      },
    },
    coverImage: {
      public_id: String,
      url: String,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["Viewer", "Editor", "Admin"],
          default: "Viewer",
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
        acceptedAt: Date,
      },
    ],
    tags: [String],
    notes: {
      type: String,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },
    weatherForecast: [
      {
        date: Date,
        temperature: {
          min: Number,
          max: Number,
        },
        condition: String,
        icon: String,
      },
    ],
    meta: {
      views: {
        type: Number,
        default: 0,
      },
      likes: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Calculate duration before saving
tripSchema.pre("save", function (next) {
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.duration = diffDays;
  }
  next();
});

// Virtual for trip progress
tripSchema.virtual("progress").get(function () {
  if (this.status === "Completed") return 100;
  if (this.status === "Cancelled") return 0;

  const now = new Date();
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);

  if (now < start) return 0;
  if (now > end) return 100;

  const total = end - start;
  const elapsed = now - start;
  return Math.round((elapsed / total) * 100);
});

// Virtual for budget remaining
tripSchema.virtual("budgetRemaining").get(function () {
  return this.budget.total - this.budget.spent;
});

// Virtual for budget percentage
tripSchema.virtual("budgetPercentage").get(function () {
  if (this.budget.total === 0) return 0;
  return Math.round((this.budget.spent / this.budget.total) * 100);
});

// Ensure virtual fields are serialized
tripSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Trip", tripSchema);
