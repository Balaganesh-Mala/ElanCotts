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

/* USER (PUBLIC / USER-SAFE) */
router.get("/active-announcement", getActiveAnnouncement);
router.post("/validate", protect, validateCoupon);

/* ADMIN */
router.post("/", protect, isAdmin, createCoupon);
router.get("/", protect, isAdmin, getCoupons);
router.put("/:id", protect, isAdmin, updateCoupon);
router.delete("/:id", protect, isAdmin, deleteCoupon);

export default router;
