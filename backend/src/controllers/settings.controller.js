import asyncHandler from "express-async-handler";
import Settings from "../models/settings.model.js";
import { uploadLogoToCloudinary } from "../middleware/settingsUpload.middleware.js";

//
// 📦 Get Settings (Public + Admin)
//
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({ storeName:"Hunger Bites" });
  }
  res.status(200).json({ success:true, settings });
});

//
// ⚙ Update Settings (Admin only) + Upload Logo ✅
//
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }

  const { storeName, supportEmail, supportPhone, address } = req.body;

  if (storeName) settings.storeName = storeName;
  if (supportEmail) settings.supportEmail = supportEmail;
  if (supportPhone) settings.supportPhone = supportPhone;
  if (address) settings.address = address;

  if (req.file) {
    const uploadedLogo = await uploadLogoToCloudinary(req.file.buffer, req.file.originalname);
    settings.logo = uploadedLogo; // ✅ store optimized Cloudinary URL
  }

  await settings.save();

  res.status(200).json({ success:true, message:"Settings updated ✅", settings });
});
