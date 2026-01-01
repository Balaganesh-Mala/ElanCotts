import express from "express";
import {upload} from "../middleware/upload.middleware.js";

import {
  createHeroSlide,
  getHeroSlides,
  updateHeroSlide,
  deleteHeroSlide
} from "../controllers/hero.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// Public
router.get("/", getHeroSlides);

// Admin
router.post("/create", protect, isAdmin, upload.single("image"), createHeroSlide);
router.put("/:id", protect, isAdmin, upload.single("image"), updateHeroSlide);
router.delete("/:id", protect, isAdmin, deleteHeroSlide);

export default router;
