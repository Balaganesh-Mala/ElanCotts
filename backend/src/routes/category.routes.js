import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  hardDeleteCategory,
  getCategoryTree,
} from "../controllers/category.controller.js";
import { upload } from "../middleware/upload.middleware.js";

import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

/* =====================================================
   PUBLIC ROUTES (No Auth Required)
   Used by frontend (menus, filters, listings)
===================================================== */
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

/* =====================================================
   ADMIN ROUTES (Protected)
   Used by Admin Dashboard
===================================================== */

router.post(
  "/",
  protect,
  isAdmin,
  upload.single("categoryImage"),
  createCategory
);

router.put(
  "/:id",
  protect,
  isAdmin,
  upload.single("categoryImage"),
  updateCategory
);

router.delete("/:id", protect, isAdmin, deleteCategory);
router.delete("/:id/hard", protect, isAdmin, hardDeleteCategory);

/* ================= CATEGORY TREE ================= */
router.get("/tree/all", getCategoryTree);
router.get("/:id", getCategoryById);


export default router;
