const PackingList = require("../models/PackingList");
const Trip = require("../models/Trip");
const { validationResult } = require("express-validator");

// Get all packing lists for a trip
exports.getPackingLists = async (req, res, next) => {
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
    const packingLists = await PackingList.find({ trip: req.params.tripId });
    res
      .status(200)
      .json({ success: true, count: packingLists.length, data: packingLists });
  } catch (error) {
    next(error);
  }
};

// Get single packing list
exports.getPackingList = async (req, res, next) => {
  try {
    const packingList = await PackingList.findById(req.params.id);
    if (!packingList) {
      return res
        .status(404)
        .json({ success: false, message: "Packing list not found" });
    }
    const trip = await Trip.findById(packingList.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to access this packing list",
        });
    }
    res.status(200).json({ success: true, data: packingList });
  } catch (error) {
    next(error);
  }
};

// Create new packing list
exports.createPackingList = async (req, res, next) => {
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
          message: "Not authorized to create packing list for this trip",
        });
    }
    const packingList = await PackingList.create({
      ...req.body,
      trip: req.params.tripId,
    });
    res
      .status(201)
      .json({
        success: true,
        message: "Packing list created successfully!",
        data: packingList,
      });
  } catch (error) {
    next(error);
  }
};

// Update packing list
exports.updatePackingList = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const packingList = await PackingList.findById(req.params.id);
    if (!packingList) {
      return res
        .status(404)
        .json({ success: false, message: "Packing list not found" });
    }
    const trip = await Trip.findById(packingList.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update this packing list",
        });
    }
    const updatedPackingList = await PackingList.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Packing list updated successfully!",
        data: updatedPackingList,
      });
  } catch (error) {
    next(error);
  }
};

// Delete packing list
exports.deletePackingList = async (req, res, next) => {
  try {
    const packingList = await PackingList.findById(req.params.id);
    if (!packingList) {
      return res
        .status(404)
        .json({ success: false, message: "Packing list not found" });
    }
    const trip = await Trip.findById(packingList.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this packing list",
        });
    }
    await packingList.remove();
    res
      .status(200)
      .json({ success: true, message: "Packing list deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

// Add item to packing list
exports.addItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const packingList = await PackingList.findById(req.params.id);
    if (!packingList) {
      return res
        .status(404)
        .json({ success: false, message: "Packing list not found" });
    }
    const trip = await Trip.findById(packingList.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to add items to this packing list",
        });
    }
    packingList.items.push(req.body);
    await packingList.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Item added successfully!",
        data: packingList,
      });
  } catch (error) {
    next(error);
  }
};

// Update item in packing list
exports.updateItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const packingList = await PackingList.findById(req.params.id);
    if (!packingList) {
      return res
        .status(404)
        .json({ success: false, message: "Packing list not found" });
    }
    const trip = await Trip.findById(packingList.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update items in this packing list",
        });
    }
    const itemIndex = packingList.items.findIndex(
      (item) => item._id.toString() === req.params.itemId
    );
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    packingList.items[itemIndex] = {
      ...packingList.items[itemIndex].toObject(),
      ...req.body,
    };
    await packingList.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Item updated successfully!",
        data: packingList,
      });
  } catch (error) {
    next(error);
  }
};

// Delete item from packing list
exports.deleteItem = async (req, res, next) => {
  try {
    const packingList = await PackingList.findById(req.params.id);
    if (!packingList) {
      return res
        .status(404)
        .json({ success: false, message: "Packing list not found" });
    }
    const trip = await Trip.findById(packingList.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete items from this packing list",
        });
    }
    packingList.items = packingList.items.filter(
      (item) => item._id.toString() !== req.params.itemId
    );
    await packingList.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Item deleted successfully!",
        data: packingList,
      });
  } catch (error) {
    next(error);
  }
};

// Toggle item packed status
exports.toggleItemPacked = async (req, res, next) => {
  try {
    const packingList = await PackingList.findById(req.params.id);
    if (!packingList) {
      return res
        .status(404)
        .json({ success: false, message: "Packing list not found" });
    }
    const trip = await Trip.findById(packingList.trip);
    const isOwner = trip.user.toString() === req.user.id;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.user.toString() === req.user.id
    );
    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update items in this packing list",
        });
    }
    const itemIndex = packingList.items.findIndex(
      (item) => item._id.toString() === req.params.itemId
    );
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    packingList.items[itemIndex].isPacked =
      !packingList.items[itemIndex].isPacked;
    await packingList.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Item packed status toggled successfully!",
        data: packingList,
      });
  } catch (error) {
    next(error);
  }
};

// Generate packing list from template
exports.generateFromTemplate = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { template, destination, duration, season } = req.body;
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
          message: "Not authorized to create packing list for this trip",
        });
    }
    const generatedItems = generatePackingListItems(
      template,
      destination,
      duration,
      season
    );
    const packingList = await PackingList.create({
      title: `Packing List - ${template}`,
      description: `Generated packing list for ${template} trip`,
      trip: req.params.tripId,
      items: generatedItems,
    });
    res
      .status(201)
      .json({
        success: true,
        message: "Packing list generated successfully!",
        data: packingList,
      });
  } catch (error) {
    next(error);
  }
};

// Helper function to generate packing list items
function generatePackingListItems(template, destination, duration, season) {
  const templates = {
    beach: [
      { name: "Swimsuit", category: "Clothing", quantity: 2, isPacked: false },
      {
        name: "Beach Towel",
        category: "Beach Gear",
        quantity: 1,
        isPacked: false,
      },
      {
        name: "Sunscreen",
        category: "Toiletries",
        quantity: 1,
        isPacked: false,
      },
      {
        name: "Beach Bag",
        category: "Accessories",
        quantity: 1,
        isPacked: false,
      },
      {
        name: "Flip Flops",
        category: "Footwear",
        quantity: 1,
        isPacked: false,
      },
    ],
    mountain: [
      {
        name: "Hiking Boots",
        category: "Footwear",
        quantity: 1,
        isPacked: false,
      },
      {
        name: "Warm Jacket",
        category: "Clothing",
        quantity: 1,
        isPacked: false,
      },
      { name: "Backpack", category: "Equipment", quantity: 1, isPacked: false },
      {
        name: "Water Bottle",
        category: "Essentials",
        quantity: 1,
        isPacked: false,
      },
      {
        name: "First Aid Kit",
        category: "Safety",
        quantity: 1,
        isPacked: false,
      },
    ],
    city: [
      {
        name: "Comfortable Shoes",
        category: "Footwear",
        quantity: 1,
        isPacked: false,
      },
      {
        name: "Day Bag",
        category: "Accessories",
        quantity: 1,
        isPacked: false,
      },
      { name: "Camera", category: "Electronics", quantity: 1, isPacked: false },
      {
        name: "Power Bank",
        category: "Electronics",
        quantity: 1,
        isPacked: false,
      },
      {
        name: "City Map",
        category: "Navigation",
        quantity: 1,
        isPacked: false,
      },
    ],
    business: [
      {
        name: "Business Suit",
        category: "Clothing",
        quantity: 2,
        isPacked: false,
      },
      {
        name: "Dress Shoes",
        category: "Footwear",
        quantity: 1,
        isPacked: false,
      },
      { name: "Laptop", category: "Electronics", quantity: 1, isPacked: false },
      {
        name: "Business Cards",
        category: "Essentials",
        quantity: 1,
        isPacked: false,
      },
      {
        name: "Portfolio",
        category: "Documents",
        quantity: 1,
        isPacked: false,
      },
    ],
  };
  return templates[template] || templates.city;
}

// Get packing list statistics
exports.getPackingListStats = async (req, res, next) => {
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
    const packingLists = await PackingList.find({ trip: req.params.tripId });
    const totalItems = packingLists.reduce(
      (sum, list) => sum + list.items.length,
      0
    );
    const packedItems = packingLists.reduce(
      (sum, list) => sum + list.items.filter((item) => item.isPacked).length,
      0
    );
    const totalWeight = packingLists.reduce(
      (sum, list) => sum + list.totalWeight,
      0
    );
    const totalCost = packingLists.reduce(
      (sum, list) => sum + list.totalCost,
      0
    );
    const stats = {
      totalLists: packingLists.length,
      totalItems,
      packedItems,
      packingProgress: totalItems > 0 ? (packedItems / totalItems) * 100 : 0,
      totalWeight,
      totalCost,
    };
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
