import express from "express";
import {
  createCodOrder,
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  downloadInvoice,
  previewOrder,
} from "../controllers/order.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

/* =====================================================
   USER ROUTES
===================================================== */

/**
 * @route   POST /api/orders/cod
 * @desc    Create COD order
 * @access  Protected (User)
 */
router.post("/cod", protect, createCodOrder);

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get logged-in user's orders
 * @access  Protected (User)
 */
router.get("/my-orders", protect, getMyOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order (own order)
 * @access  Protected (User)
 */
router.get("/:id", protect, getMyOrderById);
router.get("/:id/invoice", protect, downloadInvoice);
router.post("/preview", protect, previewOrder);


/* =====================================================
   ADMIN ROUTES
===================================================== */

/**
 * @route   GET /api/orders
 * @desc    Get all orders
 * @access  Protected (Admin)
 */
router.get("/", protect, isAdmin, getAllOrders);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Protected (Admin)
 */
router.put("/:id/status", protect, isAdmin, updateOrderStatus);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Delete order (dangerous)
 * @access  Protected (Admin)
 */
router.delete("/:id", protect, isAdmin, deleteOrder);

export default router;
