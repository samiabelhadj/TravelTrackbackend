const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Destination name is required"],
      trim: true,
      maxlength: [100, "Destination name cannot exceed 100 characters"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        caption: String,
      },
    ],
    mainImage: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/your-cloud/image/upload/v1/default-destination.jpg",
      },
    },
    categories: [
      {
        type: String,
        enum: [
          "Beach",
          "Mountain",
          "City",
          "Adventure",
          "Food",
          "Culture",
          "Nature",
          "Historical",
          "Shopping",
          "Nightlife",
          "Luxury",
          "Honeymoon",
          "Romantic",
          "Lake"
        ],
        required: true,
      },
    ],
    coordinates: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        title: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, "Review title cannot exceed 100 characters"],
        },
        comment: {
          type: String,
          required: true,
          trim: true,
          maxlength: [1000, "Review comment cannot exceed 1000 characters"],
        },
        images: [
          {
            public_id: String,
            url: String,
          },
        ],
        helpful: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    exploreFeatures: {
      topAttractions: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          description: {
            type: String,
            trim: true,
          },
          image: {
            public_id: String,
            url: String,
          },
          rating: {
            type: Number,
            min: 0,
            max: 5,
          },
          category: {
            type: String,
            enum: [
              "Landmark",
              "Museum",
              "Park",
              "Restaurant",
              "Shopping",
              "Entertainment",
            ],
          },
          location: {
            address: String,
            coordinates: {
              latitude: Number,
              longitude: Number,
            },
          },
          priceRange: {
            type: String,
            enum: ["Free", "Low", "Medium", "High"],
          },
          openingHours: {
            open: String,
            close: String,
            days: [String],
          },
        },
      ],
      localCuisine: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          description: {
            type: String,
            trim: true,
          },
          image: {
            public_id: String,
            url: String,
          },
          priceRange: {
            type: String,
            enum: ["Budget", "Mid-range", "Luxury"],
          },
          category: {
            type: String,
            enum: ["Restaurant", "Street Food", "Cafe", "Bar"],
          },
        },
      ],
      activities: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          description: {
            type: String,
            trim: true,
          },
          image: {
            public_id: String,
            url: String,
          },
          category: {
            type: String,
            enum: [
              "Adventure",
              "Cultural",
              "Relaxation",
              "Sports",
              "Entertainment",
            ],
          },
          duration: {
            type: String,
            enum: ["Half Day", "Full Day", "Multi Day"],
          },
          priceRange: {
            type: String,
            enum: ["Budget", "Mid-range", "Luxury"],
          },
          difficulty: {
            type: String,
            enum: ["Easy", "Moderate", "Hard"],
          },
        },
      ],
    },
    budget: {
      type: String,
      enum: ["Budget", "Mid-range", "Luxury"],
      default: "Mid-range",
    },
    bestTimeToVisit: {
      startMonth: {
        type: Number,
        min: 1,
        max: 12,
      },
      endMonth: {
        type: Number,
        min: 1,
        max: 12,
      },
      description: String,
    },
    attractions: [
      {
        name: {
          type: String,
          required: true,
        },
        description: String,
        type: {
          type: String,
          enum: [
            "Museum",
            "Park",
            "Restaurant",
            "Hotel",
            "Shopping",
            "Entertainment",
            "Historical",
            "Natural",
            
          ],
        },
        coordinates: {
          latitude: Number,
          longitude: Number,
        },
        rating: {
          type: Number,
          min: 0,
          max: 5,
          default: 0,
        },
        priceRange: {
          type: String,
          enum: ["Free", "Low", "Medium", "High"],
        },
      },
    ],
    weather: {
      averageTemperature: {
        summer: Number,
        winter: Number,
        spring: Number,
        fall: Number,
      },
      climate: {
        type: String,
        enum: [
          "Tropical",
          "Temperate",
          "Desert",
          "Mediterranean",
          "Alpine",
          "Arctic",
        ],
      },
    },
    languages: [
      {
        type: String,
      },
    ],
    currency: {
      type: String,
      default: "USD",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    meta: {
      views: {
        type: Number,
        default: 0,
      },
      favorites: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for search functionality
destinationSchema.index({
  name: "text",
  country: "text",
  city: "text",
  description: "text",
  categories: "text",
  tags: "text",
});

// Virtual for full location
destinationSchema.virtual("fullLocation").get(function () {
  return `${this.city}, ${this.country}`;
});

// Ensure virtual fields are serialized
destinationSchema.set("toJSON", {
  virtuals: true,
});

// Calculate average rating when reviews are added/updated
destinationSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }

  const totalRating = this.reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  this.rating.average = totalRating / this.reviews.length;
  this.rating.count = this.reviews.length;
};

// Add review method
destinationSchema.methods.addReview = function (userId, reviewData) {
  const review = {
    user: userId,
    rating: reviewData.rating,
    title: reviewData.title,
    comment: reviewData.comment,
    images: reviewData.images || [],
  };

  this.reviews.push(review);
  this.calculateAverageRating();
  return this.save();
};

// Update review method
destinationSchema.methods.updateReview = function (
  reviewId,
  userId,
  reviewData
) {
  const review = this.reviews.id(reviewId);
  if (!review || review.user.toString() !== userId.toString()) {
    throw new Error("Review not found or unauthorized");
  }

  review.rating = reviewData.rating;
  review.title = reviewData.title;
  review.comment = reviewData.comment;
  if (reviewData.images) {
    review.images = reviewData.images;
  }

  this.calculateAverageRating();
  return this.save();
};

// Delete review method
destinationSchema.methods.deleteReview = function (reviewId, userId) {
  const review = this.reviews.id(reviewId);
  if (!review || review.user.toString() !== userId.toString()) {
    throw new Error("Review not found or unauthorized");
  }

  review.remove();
  this.calculateAverageRating();
  return this.save();
};

// Toggle helpful on review
destinationSchema.methods.toggleReviewHelpful = function (reviewId, userId) {
  const review = this.reviews.id(reviewId);
  if (!review) {
    throw new Error("Review not found");
  }

  const helpfulIndex = review.helpful.findIndex(
    (h) => h.user.toString() === userId.toString()
  );

  if (helpfulIndex > -1) {
    review.helpful.splice(helpfulIndex, 1);
  } else {
    review.helpful.push({ user: userId });
  }

  return this.save();
};

// Virtual for full location
destinationSchema.virtual("fullLocation").get(function () {
  return `${this.city}, ${this.country}`;
});

// Index for search
destinationSchema.index({
  name: "text",
  description: "text",
  city: "text",
  country: "text",
});

module.exports = mongoose.model("Destination", destinationSchema);
