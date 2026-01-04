import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

/* ================= MULTER ================= */
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 10MB per image
  },
});

/* ================= SINGLE IMAGE ================= */
export const uploadToCloudinary = (buffer, folder = "products") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);

        resolve({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

/* ================= MULTIPLE IMAGES ================= */
export const uploadMultipleToCloudinary = async (
  files,
  folder = "products"
) => {
  const results = [];

  for (const file of files) {
    if (!file?.buffer) continue;

    const uploaded = await uploadToCloudinary(file.buffer, folder);
    results.push(uploaded);
  }

  return results;
};


export const uploadVideoToCloudinary = (buffer, folder = "videos") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "video",
        timeout: 120000,
      },
      (error, result) => {
        if (error) return reject(error);

        resolve({
          public_id: result.public_id,
          url: result.secure_url,
          duration: result.duration,
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};