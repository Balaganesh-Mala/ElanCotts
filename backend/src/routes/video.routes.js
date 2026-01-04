import express from "express";
import {
  createVideo,
  getVideos,
  updateVideo,
  deleteVideo,
} from "../controllers/video.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/upload.middleware.js"; 

const router = express.Router();

/* PUBLIC */
router.get("/", getVideos);

/* ADMIN */
router.post(
  "/",
  protect,
  isAdmin,
  upload.single("video"), // ✅ MEMORY STORAGE
  createVideo
);

router.put("/:id", protect, isAdmin, updateVideo);
router.delete("/:id", protect, isAdmin, deleteVideo);

export default router;
