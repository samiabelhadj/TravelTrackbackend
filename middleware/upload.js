const multer = require("multer");
const path = require("path");
const { uploadImage, deleteImage } = require("../utils/cloudinary");

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Single image upload middleware
const uploadSingleImage = upload.single("image");

// Multiple images upload middleware
const uploadMultipleImages = upload.array("images", 10); // Max 10 images

// Process uploaded image and upload to Cloudinary
const processImageUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await uploadImage(dataURI, "traveltrack");

    // Add image info to request
    req.uploadedImage = {
      public_id: result.public_id,
      url: result.url,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Process multiple image uploads
const processMultipleImageUploads = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const uploadPromises = req.files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString("base64");
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      return await uploadImage(dataURI, "traveltrack");
    });

    const results = await Promise.all(uploadPromises);
    req.uploadedImages = results;

    next();
  } catch (error) {
    next(error);
  }
};

// Delete image from Cloudinary when updating/deleting
const deleteImageFromCloudinary = async (public_id) => {
  if (public_id && public_id !== "null") {
    try {
      await deleteImage(public_id);
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
    }
  }
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  processImageUpload,
  processMultipleImageUploads,
  deleteImageFromCloudinary,
};
