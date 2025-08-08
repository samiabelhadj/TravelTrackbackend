const mongoose = require("mongoose");

const packingItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: [100, "Item name cannot exceed 100 characters"],
    },
    category: {
      type: String,
      enum: [
        "Clothing",
        "Electronics",
        "Toiletries",
        "Documents",
        "Accessories",
        "Medication",
        "Food",
        "Other",
      ],
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    isPacked: {
      type: Boolean,
      default: false,
    },
    isEssential: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      maxlength: [200, "Notes cannot exceed 200 characters"],
    },
    weight: {
      type: Number, // in grams
      default: 0,
    },
    estimatedCost: {
      amount: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
  },
  {
    timestamps: true,
  }
);

const packingListSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Packing list title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    items: [packingItemSchema],
    categories: [
      {
        name: {
          type: String,
          required: true,
        },
        color: {
          type: String,
          default: "#3B82F6",
        },
        icon: String,
      },
    ],
    totalWeight: {
      type: Number, // in grams
      default: 0,
    },
    totalEstimatedCost: {
      amount: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    templateCategory: {
      type: String,
      enum: [
        "Beach",
        "Mountain",
        "City",
        "Business",
        "Camping",
        "Cruise",
        "Backpacking",
      ],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Calculate totals before saving
packingListSchema.pre("save", function (next) {
  let totalWeight = 0;
  let totalCost = 0;

  this.items.forEach((item) => {
    totalWeight += item.weight * item.quantity;
    totalCost += item.estimatedCost.amount * item.quantity;
  });

  this.totalWeight = totalWeight;
  this.totalEstimatedCost.amount = totalCost;
  next();
});

// Virtual for packed items count
packingListSchema.virtual("packedItems").get(function () {
  return this.items.filter((item) => item.isPacked).length;
});

// Virtual for total items count
packingListSchema.virtual("totalItems").get(function () {
  return this.items.length;
});

// Virtual for packing progress percentage
packingListSchema.virtual("packingProgress").get(function () {
  const total = this.totalItems;
  const packed = this.packedItems;
  return total > 0 ? Math.round((packed / total) * 100) : 0;
});

// Virtual for essential items count
packingListSchema.virtual("essentialItems").get(function () {
  return this.items.filter((item) => item.isEssential).length;
});

// Ensure virtual fields are serialized
packingListSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("PackingList", packingListSchema);
