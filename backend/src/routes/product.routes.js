import express from "express";
import {
  createProduct,
  getProductsByCategory,
  getProductBySlug,
  addProductReview,
  getAllProductsAdmin,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
  getAllProductsPublic,
} from "../controllers/product.controller.js";

import { upload } from "../middleware/upload.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

/* ===== PUBLIC ===== */
router.get("/all", getAllProductsPublic);              // ✅ MOVE UP
router.get("/category/:slug", getProductsByCategory); // ✅
router.get("/:slug", getProductBySlug);                // LAST

/* ===== ADMIN ===== */
router.get("/",  getAllProductsAdmin);

router.post(
  "/",
  protect,
  isAdmin,
  upload.fields([
    { name: "productImages", maxCount: 5 },
    { name: "variantImages_0", maxCount: 5 },
    { name: "variantImages_1", maxCount: 5 },
    { name: "variantImages_2", maxCount: 5 },
  ]),
  createProduct
);

router.put(
  "/:id",
  protect,
  isAdmin,
  upload.fields([
    { name: "productImages", maxCount: 5 },
    { name: "variantImages_0", maxCount: 5 },
    { name: "variantImages_1", maxCount: 5 },
    { name: "variantImages_2", maxCount: 5 },
  ]),
  updateProduct
);

router.delete("/:id", protect, isAdmin, deleteProduct);
router.delete("/:id/hard", protect, isAdmin, hardDeleteProduct);

/* ===== REVIEWS ===== */
router.post("/:id/reviews", protect, addProductReview);

export default router;
