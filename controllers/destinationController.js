const Destination = require("../models/Destination");
const { validationResult } = require("express-validator");
const { deleteImageFromCloudinary } = require("../middleware/upload");

// Get all destinations
exports.getAllDestinations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Destination.countDocuments();
    let query = Destination.find();
    if (req.query.category)
      query = query.where("categories").in([req.query.category]);
    if (req.query.country)
      query = query.where("country").regex(new RegExp(req.query.country, "i"));
    if (req.query.city)
      query = query.where("city").regex(new RegExp(req.query.city, "i"));
    if (req.query.minRating)
      query = query.where("rating").gte(parseFloat(req.query.minRating));
    if (req.query.maxBudget)
      query = query.where("budget.amount").lte(parseFloat(req.query.maxBudget));
    if (req.query.sort) {
      const sortOrder = req.query.order === "desc" ? -1 : 1;
      query = query.sort({ [req.query.sort]: sortOrder });
    } else {
      query = query.sort("-rating");
    }
    const destinations = await query.skip(startIndex).limit(limit);
    const pagination = {};
    if (endIndex < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };
    res.status(200).json({
      success: true,
      count: destinations.length,
      pagination,
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
};

// Create destination
exports.createDestination = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Handle image upload if present
    if (req.uploadedImage) {
      req.body.mainImage = req.uploadedImage;
    }

    // Handle multiple images if present
    if (req.uploadedImages && req.uploadedImages.length > 0) {
      req.body.images = req.uploadedImages;
    }

    const destination = await Destination.create(req.body);
    res.status(201).json({
      success: true,
      message: "Destination created successfully",
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

// Get single destination
exports.getDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res
        .status(404)
        .json({ success: false, message: "Destination not found" });
    }
    res.status(200).json({ success: true, data: destination });
  } catch (error) {
    next(error);
  }
};

// Update destination
exports.updateDestination = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Get existing destination to check for old images
    const existingDestination = await Destination.findById(req.params.id);
    if (!existingDestination) {
      return res
        .status(404)
        .json({ success: false, message: "Destination not found" });
    }

    // Handle image upload if present
    if (req.uploadedImage) {
      // Delete old main image if it exists
      if (
        existingDestination.mainImage &&
        existingDestination.mainImage.public_id
      ) {
        await deleteImageFromCloudinary(
          existingDestination.mainImage.public_id
        );
      }
      req.body.mainImage = req.uploadedImage;
    }

    // Handle multiple images if present
    if (req.uploadedImages && req.uploadedImages.length > 0) {
      req.body.images = req.uploadedImages;
    }

    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Destination updated successfully",
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

// Delete destination
exports.deleteDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res
        .status(404)
        .json({ success: false, message: "Destination not found" });
    }

    // Delete images from Cloudinary
    if (destination.mainImage && destination.mainImage.public_id) {
      await deleteImageFromCloudinary(destination.mainImage.public_id);
    }

    if (destination.images && destination.images.length > 0) {
      const imageIds = destination.images
        .map((img) => img.public_id)
        .filter((id) => id);
      for (const id of imageIds) {
        await deleteImageFromCloudinary(id);
      }
    }

    // Delete the destination
    await Destination.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Destination deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get featured destinations
exports.getFeaturedDestinations = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 6;
    const destinations = await Destination.find({ isFeatured: true })
      .limit(limit)
      .sort("-rating");
    res
      .status(200)
      .json({ success: true, count: destinations.length, data: destinations });
  } catch (error) {
    next(error);
  }
};

// Get popular destinations
exports.getPopularDestinations = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 8;
    const destinations = await Destination.find()
      .limit(limit)
      .sort("-rating -visitCount");
    res
      .status(200)
      .json({ success: true, count: destinations.length, data: destinations });
  } catch (error) {
    next(error);
  }
};

// Search destinations
exports.searchDestinations = async (req, res, next) => {
  try {
    const {
      q,
      category,
      country,
      minRating,
      maxBudget,
      sort,
      order,
      page,
      limit,
    } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const total = await Destination.countDocuments();
    let query = Destination.find();
    if (q) {
      query = query.or([
        { name: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ]);
    }
    if (category) query = query.where("categories").in([category]);
    if (country) query = query.where("country").regex(new RegExp(country, "i"));
    if (minRating) query = query.where("rating").gte(parseFloat(minRating));
    if (maxBudget)
      query = query.where("budget.amount").lte(parseFloat(maxBudget));
    if (sort) {
      const sortOrder = order === "desc" ? -1 : 1;
      query = query.sort({ [sort]: sortOrder });
    } else {
      query = query.sort("-rating");
    }
    const destinations = await query.skip(startIndex).limit(limitNum);
    const pagination = {};
    if (endIndex < total)
      pagination.next = { page: pageNum + 1, limit: limitNum };
    if (startIndex > 0)
      pagination.prev = { page: pageNum - 1, limit: limitNum };
    res.status(200).json({
      success: true,
      count: destinations.length,
      pagination,
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
};

// Get destinations by category
exports.getDestinationsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Destination.countDocuments({ categories: category });
    const destinations = await Destination.find({ categories: category })
      .skip(startIndex)
      .limit(limit)
      .sort("-rating");
    const pagination = {};
    if (endIndex < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };
    res.status(200).json({
      success: true,
      count: destinations.length,
      pagination,
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
};

// Get destinations by country
exports.getDestinationsByCountry = async (req, res, next) => {
  try {
    const { country } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Destination.countDocuments({
      country: { $regex: country, $options: "i" },
    });
    const destinations = await Destination.find({
      country: { $regex: country, $options: "i" },
    })
      .skip(startIndex)
      .limit(limit)
      .sort("-rating");
    const pagination = {};
    if (endIndex < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };
    res.status(200).json({
      success: true,
      count: destinations.length,
      pagination,
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
};

// Get available categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Destination.distinct("categories");
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// Get available countries
exports.getCountries = async (req, res, next) => {
  try {
    const countries = await Destination.distinct("country");
    res.status(200).json({ success: true, data: countries });
  } catch (error) {
    next(error);
  }
};

// Increment visit count
exports.incrementVisitCount = async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      { $inc: { visitCount: 1 } },
      { new: true }
    );
    if (!destination) {
      return res
        .status(404)
        .json({ success: false, message: "Destination not found" });
    }
    res
      .status(200)
      .json({ success: true, data: { visitCount: destination.visitCount } });
  } catch (error) {
    next(error);
  }
};

// Add destination rating
exports.addRating = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { rating, review } = req.body;
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res
        .status(404)
        .json({ success: false, message: "Destination not found" });
    }
    destination.ratings.push({
      user: req.user.id,
      rating,
      review,
      date: new Date(),
    });
    const totalRating = destination.ratings.reduce(
      (sum, r) => sum + r.rating,
      0
    );
    destination.rating = totalRating / destination.ratings.length;
    await destination.save();
    res.status(200).json({
      success: true,
      message: "Rating added successfully!",
      data: {
        rating: destination.rating,
        totalRatings: destination.ratings.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add review
exports.addReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res
        .status(404)
        .json({ success: false, message: "Destination not found" });
    }

    // Check if user already reviewed this destination
    const existingReview = destination.reviews.find(
      (review) => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this destination",
      });
    }

    const reviewData = {
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment,
      images: req.body.images || [],
    };

    await destination.addReview(req.user.id, reviewData);

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

// Update review
exports.updateReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res
        .status(404)
        .json({ success: false, message: "Destination not found" });
    }

    const reviewData = {
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment,
      images: req.body.images,
    };

    await destination.updateReview(
      req.params.reviewId,
      req.user.id,
      reviewData
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

// Delete review
exports.deleteReview = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res
        .status(404)
        .json({ success: false, message: "Destination not found" });
    }

    await destination.deleteReview(req.params.reviewId, req.user.id);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

// Toggle review helpful
exports.toggleReviewHelpful = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res
        .status(404)
        .json({ success: false, message: "Destination not found" });
    }

    await destination.toggleReviewHelpful(req.params.reviewId, req.user.id);

    res.status(200).json({
      success: true,
      message: "Review helpful status updated",
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

// Upload multiple images to destination
exports.uploadDestinationImages = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res
        .status(404)
        .json({ success: false, message: "Destination not found" });
    }

    if (!req.uploadedImages || req.uploadedImages.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No images uploaded" });
    }

    // Add new images to the destination
    destination.images.push(...req.uploadedImages);
    await destination.save();

    res.status(200).json({
      success: true,
      message: `${req.uploadedImages.length} images uploaded successfully`,
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

// Get destination reviews
exports.getDestinationReviews = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id)
      .populate("reviews.user", "firstName lastName avatar")
      .select("reviews");

    if (!destination) {
      return res
        .status(404)
        .json({ success: false, message: "Destination not found" });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const reviews = destination.reviews.slice(startIndex, endIndex);
    const total = destination.reviews.length;

    const pagination = {};
    if (endIndex < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };

    res.status(200).json({
      success: true,
      count: reviews.length,
      pagination,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
