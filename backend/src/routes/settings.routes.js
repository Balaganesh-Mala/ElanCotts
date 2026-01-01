import express from "express";
import upload from "../middleware/settingsUpload.middleware.js";

import {
  getSettings,
  updateSettings
} from "../controllers/settings.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// Public route → no login needed ✅
router.get("/public", getSettings);

// Admin-only view of settings ✅
router.get("/", protect, isAdmin, getSettings);

// Update settings + logo upload ✅
router.put("/", protect, isAdmin, upload.single("logo"), updateSettings);

export default router;
