import multer from "multer";
import sharp from "sharp";
import cloudinary from "../config/cloudinary.js";

const upload = multer({ storage: multer.memoryStorage() });

export const uploadLogoToCloudinary = async (buffer, filename) => {
  const optimized = await sharp(buffer)
    .resize(500)
    .toFormat("webp", { quality: 80 })
    .toBuffer();

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "ecommerce-settings-logo", resource_type: "image" },
      (err, res) => {
        if (err) reject(err);
        else resolve(res);
      }
    ).end(optimized);
  });

  return { public_id: result.public_id, url: result.secure_url }; // ✅ FIXED field names
};

export default upload;
