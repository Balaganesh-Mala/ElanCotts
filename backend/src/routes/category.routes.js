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
   PUBLIC ROUTES
===================================================== */

// ✅ used by shop filters, navbar, etc.
router.get("/", getAllCategories);

// ✅ category tree (parent + children)
router.get("/tree/all", getCategoryTree);

// ✅ single category by id (admin / details)
router.get("/:id", getCategoryById);

/* =====================================================
   ADMIN ROUTES
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

export default router;
