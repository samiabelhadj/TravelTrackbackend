const mongoose = require("mongoose");

const budgetItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Budget item title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      enum: [
        "Accommodation",
        "Transportation",
        "Food",
        "Activities",
        "Shopping",
        "Entertainment",
        "Health",
        "Insurance",
        "Other",
      ],
      required: true,
    },
    type: {
      type: String,
      enum: ["Income", "Expense"],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly"],
      default: "Daily",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: [
        "Cash",
        "Credit Card",
        "Debit Card",
        "Bank Transfer",
        "Digital Wallet",
        "Other",
      ],
    },
    receipt: {
      public_id: String,
      url: String,
    },
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

const budgetSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Budget title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    items: [budgetItemSchema],
    totalBudget: {
      amount: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    totalIncome: {
      amount: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    totalExpenses: {
      amount: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
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
        budget: {
          type: Number,
          default: 0,
        },
        spent: {
          type: Number,
          default: 0,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    alerts: {
      lowBudget: {
        type: Boolean,
        default: true,
      },
      overBudget: {
        type: Boolean,
        default: true,
      },
      threshold: {
        type: Number,
        default: 80, // percentage
      },
    },
  },
  {
    timestamps: true,
  }
);

// Calculate totals before saving
budgetSchema.pre("save", function (next) {
  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryTotals = {};

  this.items.forEach((item) => {
    if (item.type === "Income") {
      totalIncome += item.amount;
    } else {
      totalExpenses += item.amount;

      // Calculate category totals
      if (!categoryTotals[item.category]) {
        categoryTotals[item.category] = 0;
      }
      categoryTotals[item.category] += item.amount;
    }
  });

  this.totalIncome.amount = totalIncome;
  this.totalExpenses.amount = totalExpenses;

  // Update category spent amounts
  this.categories.forEach((category) => {
    if (categoryTotals[category.name]) {
      category.spent = categoryTotals[category.name];
    }
  });

  next();
});

// Virtual for remaining budget
budgetSchema.virtual("remainingBudget").get(function () {
  return this.totalBudget.amount - this.totalExpenses.amount;
});

// Virtual for budget utilization percentage
budgetSchema.virtual("budgetUtilization").get(function () {
  if (this.totalBudget.amount === 0) return 0;
  return Math.round(
    (this.totalExpenses.amount / this.totalBudget.amount) * 100
  );
});

// Virtual for net amount (income - expenses)
budgetSchema.virtual("netAmount").get(function () {
  return this.totalIncome.amount - this.totalExpenses.amount;
});

// Virtual for paid items count
budgetSchema.virtual("paidItems").get(function () {
  return this.items.filter((item) => item.isPaid).length;
});

// Virtual for total items count
budgetSchema.virtual("totalItems").get(function () {
  return this.items.length;
});

// Virtual for payment progress percentage
budgetSchema.virtual("paymentProgress").get(function () {
  const total = this.totalItems;
  const paid = this.paidItems;
  return total > 0 ? Math.round((paid / total) * 100) : 0;
});

// Ensure virtual fields are serialized
budgetSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Budget", budgetSchema);
