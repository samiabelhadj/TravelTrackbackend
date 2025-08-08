const Budget = require("../models/Budget");
const Trip = require("../models/Trip");
const { validationResult } = require("express-validator");

// Get all budgets for a trip
exports.getBudgets = async (req, res, next) => {
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
    const budgets = await Budget.find({ trip: req.params.tripId });
    res
      .status(200)
      .json({ success: true, count: budgets.length, data: budgets });
  } catch (error) {
    next(error);
  }
};

// Get single budget
exports.getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }
    const trip = await Trip.findById(budget.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to access this budget",
        });
    }
    res.status(200).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// Create new budget
exports.createBudget = async (req, res, next) => {
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
          message: "Not authorized to create budget for this trip",
        });
    }
    const budget = await Budget.create({
      ...req.body,
      trip: req.params.tripId,
    });
    res
      .status(201)
      .json({
        success: true,
        message: "Budget created successfully!",
        data: budget,
      });
  } catch (error) {
    next(error);
  }
};

// Update budget
exports.updateBudget = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }
    const trip = await Trip.findById(budget.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update this budget",
        });
    }
    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Budget updated successfully!",
        data: updatedBudget,
      });
  } catch (error) {
    next(error);
  }
};

// Delete budget
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }
    const trip = await Trip.findById(budget.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this budget",
        });
    }
    await budget.remove();
    res
      .status(200)
      .json({ success: true, message: "Budget deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

// Add item to budget
exports.addItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }
    const trip = await Trip.findById(budget.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to add items to this budget",
        });
    }
    budget.items.push(req.body);
    await budget.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Item added successfully!",
        data: budget,
      });
  } catch (error) {
    next(error);
  }
};

// Update item in budget
exports.updateItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }
    const trip = await Trip.findById(budget.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update items in this budget",
        });
    }
    const itemIndex = budget.items.findIndex(
      (item) => item._id.toString() === req.params.itemId
    );
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    budget.items[itemIndex] = {
      ...budget.items[itemIndex].toObject(),
      ...req.body,
    };
    await budget.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Item updated successfully!",
        data: budget,
      });
  } catch (error) {
    next(error);
  }
};

// Delete item from budget
exports.deleteItem = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }
    const trip = await Trip.findById(budget.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete items from this budget",
        });
    }
    budget.items = budget.items.filter(
      (item) => item._id.toString() !== req.params.itemId
    );
    await budget.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Item deleted successfully!",
        data: budget,
      });
  } catch (error) {
    next(error);
  }
};

// Toggle item paid status
exports.toggleItemPaid = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }
    const trip = await Trip.findById(budget.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update items in this budget",
        });
    }
    const itemIndex = budget.items.findIndex(
      (item) => item._id.toString() === req.params.itemId
    );
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    budget.items[itemIndex].isPaid = !budget.items[itemIndex].isPaid;
    await budget.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Item paid status toggled successfully!",
        data: budget,
      });
  } catch (error) {
    next(error);
  }
};

// Get budget statistics
exports.getBudgetStats = async (req, res, next) => {
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
    const budgets = await Budget.find({ trip: req.params.tripId });
    const totalBudget = budgets.reduce(
      (sum, budget) => sum + budget.totalBudget.amount,
      0
    );
    const totalExpenses = budgets.reduce(
      (sum, budget) => sum + budget.totalExpenses.amount,
      0
    );
    const totalIncome = budgets.reduce(
      (sum, budget) => sum + budget.totalIncome.amount,
      0
    );
    const totalItems = budgets.reduce(
      (sum, budget) => sum + budget.items.length,
      0
    );
    const paidItems = budgets.reduce(
      (sum, budget) => sum + budget.items.filter((item) => item.isPaid).length,
      0
    );
    const categoryBreakdown = {};
    budgets.forEach((budget) => {
      budget.items.forEach((item) => {
        if (!categoryBreakdown[item.category]) {
          categoryBreakdown[item.category] = 0;
        }
        categoryBreakdown[item.category] += item.amount;
      });
    });
    const stats = {
      totalBudget,
      totalExpenses,
      totalIncome,
      remainingBudget: totalBudget - totalExpenses + totalIncome,
      budgetUtilization:
        totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0,
      totalItems,
      paidItems,
      paymentProgress: totalItems > 0 ? (paidItems / totalItems) * 100 : 0,
      categoryBreakdown,
    };
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

// Add income to budget
exports.addIncome = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }
    const trip = await Trip.findById(budget.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to add income to this budget",
        });
    }
    budget.income.push(req.body);
    await budget.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Income added successfully!",
        data: budget,
      });
  } catch (error) {
    next(error);
  }
};

// Update income in budget
exports.updateIncome = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }
    const trip = await Trip.findById(budget.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update income in this budget",
        });
    }
    const incomeIndex = budget.income.findIndex(
      (income) => income._id.toString() === req.params.incomeId
    );
    if (incomeIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Income not found" });
    }
    budget.income[incomeIndex] = {
      ...budget.income[incomeIndex].toObject(),
      ...req.body,
    };
    await budget.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Income updated successfully!",
        data: budget,
      });
  } catch (error) {
    next(error);
  }
};

// Delete income from budget
exports.deleteIncome = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }
    const trip = await Trip.findById(budget.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete income from this budget",
        });
    }
    budget.income = budget.income.filter(
      (income) => income._id.toString() !== req.params.incomeId
    );
    await budget.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Income deleted successfully!",
        data: budget,
      });
  } catch (error) {
    next(error);
  }
};
