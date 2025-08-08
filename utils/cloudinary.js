const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
const uploadImage = async (file, folder = "traveltrack") => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      resource_type: "auto",
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
};

// Upload multiple images
const uploadMultipleImages = async (files, folder = "traveltrack") => {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Multiple images upload error:", error);
    throw new Error("Failed to upload images");
  }
};

// Delete image from Cloudinary
const deleteImage = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete image");
  }
};

// Delete multiple images
const deleteMultipleImages = async (public_ids) => {
  try {
    const deletePromises = public_ids.map((public_id) =>
      deleteImage(public_id)
    );
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error("Multiple images delete error:", error);
    throw new Error("Failed to delete images");
  }
};

// Generate optimized image URL
const getOptimizedImageUrl = (public_id, options = {}) => {
  const {
    width = 800,
    height = 600,
    crop = "fill",
    quality = "auto",
    format = "auto",
  } = options;

  return cloudinary.url(public_id, {
    width,
    height,
    crop,
    quality,
    format,
    secure: true,
  });
};

// Generate thumbnail URL
const getThumbnailUrl = (public_id, width = 300, height = 200) => {
  return cloudinary.url(public_id, {
    width,
    height,
    crop: "fill",
    quality: "auto",
    secure: true,
  });
};

module.exports = {
  cloudinary,
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  getOptimizedImageUrl,
  getThumbnailUrl,
};
