import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getMyPayments,
  getAllPayments,
} from "../controllers/payment.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

/* =====================================================
   USER ROUTES (PREPAID - RAZORPAY)
===================================================== */

/**
 * @route   POST /api/payments/razorpay/create
 * @desc    Create Razorpay order (before checkout)
 * @access  Protected (User)
 */
router.post("/razorpay/create", protect, createRazorpayOrder);

/**
 * @route   POST /api/payments/razorpay/verify
 * @desc    Verify Razorpay payment & create order
 * @access  Protected (User)
 */
router.post("/razorpay/verify", protect, verifyRazorpayPayment);

/**
 * @route   GET /api/payments/my
 * @desc    Get logged-in user's payment history
 * @access  Protected (User)
 */
router.get("/my", protect, getMyPayments);

/* =====================================================
   ADMIN ROUTES
===================================================== */

/**
 * @route   GET /api/payments
 * @desc    Get all payments
 * @access  Protected (Admin)
 */
router.get("/", protect, isAdmin, getAllPayments);

export default router;
