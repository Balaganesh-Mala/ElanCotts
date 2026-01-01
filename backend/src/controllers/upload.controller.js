import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
} from "../middleware/upload.middleware.js";

/* ================= PRODUCT IMAGE ================= */
export const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded",
      });
    }

    const images = await uploadMultipleToCloudinary(
      req.files,
      "elan-cotts/products"
    );

    res.status(200).json({
      success: true,
      images,
    });
  } catch (error) {
    console.error("Product Image Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
};
