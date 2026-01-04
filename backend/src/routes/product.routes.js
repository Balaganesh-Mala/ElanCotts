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
  getSimilarProducts,
  getProductByIdAdmin, // 👈 ADD
} from "../controllers/product.controller.js";

import { upload } from "../middleware/upload.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

/* ===== PUBLIC ===== */
router.get("/all", getAllProductsPublic);
router.get("/category/:slug", getProductsByCategory);
/* ===== SIMILAR PRODUCTS ===== */
router.get("/similar/:slug", getSimilarProducts);


/* ===== ADMIN (MUST BE BEFORE :slug) ===== */
router.get("/admin/:id", protect, isAdmin, getProductByIdAdmin);
router.get("/", protect, isAdmin, getAllProductsAdmin);

router.post(
  "/",
  protect,
  isAdmin,
  upload.fields([
    { name: "productImages", maxCount: 7 },
    { name: "variantImages_0", maxCount: 7 },
    { name: "variantImages_1", maxCount: 7 },
    { name: "variantImages_2", maxCount: 7 },
  ]),
  createProduct
);

router.put(
  "/:id",
  protect,
  isAdmin,
  upload.fields([
    { name: "productImages", maxCount: 7 },
    { name: "variantImages_0", maxCount: 7 },
    { name: "variantImages_1", maxCount: 7 },
    { name: "variantImages_2", maxCount: 7 },
  ]),
  updateProduct
);

router.delete("/:id", protect, isAdmin, deleteProduct);
router.delete("/:id/hard", protect, isAdmin, hardDeleteProduct);

/* ===== PUBLIC SINGLE PRODUCT ===== */
router.get("/:slug", getProductBySlug);

/* ===== REVIEWS ===== */
router.post("/:id/reviews", protect, addProductReview);

export default router;
