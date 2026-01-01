import express from "express";
import {
  createCoupon,
  getCoupons,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
  getActiveAnnouncement,
} from "../controllers/coupon.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

/* ADMIN */
router.post("/", protect, isAdmin, createCoupon);
router.get("/", protect, isAdmin, getCoupons);
router.put("/:id", protect, isAdmin, updateCoupon);
router.delete("/:id", protect, isAdmin, deleteCoupon);

/* USER (CHECKOUT VALIDATION) */
router.post("/validate", protect, validateCoupon);
router.get("/active-announcement",protect, getActiveAnnouncement);

export default router;
