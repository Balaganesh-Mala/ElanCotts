import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  applyCouponToCart,
  clearCart,
} from "../controllers/cart.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/add", addToCart);
router.get("/", getCart);
router.put("/update", updateCartItem);
router.delete("/remove/:variantSku", removeCartItem);
router.post("/apply-coupon", applyCouponToCart);
router.delete("/clear", clearCart);

export default router;
