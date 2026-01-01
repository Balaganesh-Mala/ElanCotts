import express from "express";
import { upload } from "../middleware/upload.middleware.js";
import { uploadProductImages } from "../controllers/upload.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { adminProtect } from "../middleware/admin.middleware.js";

const router = express.Router();

/* ================= PRODUCT IMAGES ================= */
// POST /api/upload/products
router.post(
  "/products",
  protect,
  adminProtect,
  upload.array("images", 10),
  uploadProductImages
);

export default router;
