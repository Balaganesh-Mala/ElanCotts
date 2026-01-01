import crypto from "crypto";
import razorpay from "../config/razorpay.js";

import Payment from "../models/payment.model.js";
import { buildOrderFromCart } from "../services/order.service.js";

/* =====================================================
   CREATE RAZORPAY ORDER
   (Called before opening Razorpay checkout)
===================================================== */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    res.status(200).json({
      success: true,
      razorpayOrder,
    });
  } catch (error) {
    console.error("Create Razorpay Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
    });
  }
};

/* =====================================================
   VERIFY PAYMENT → CREATE ORDER (PREPAID)
===================================================== */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
      couponCode,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification data missing",
      });
    }

    /* ================= VERIFY SIGNATURE ================= */
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    /* ================= CREATE ORDER (PREPAID) ================= */
    const order = await buildOrderFromCart({
      userId: req.user._id,
      shippingAddress,
      paymentMethod: "PREPAID",
      couponCode,
    });

    /* ================= SAVE PAYMENT ================= */
    const payment = await Payment.create({
      user: req.user._id,
      order: order._id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount: order.totalPrice,
      status: "PAID",
    });

    res.status(201).json({
      success: true,
      message: "Payment verified & order placed successfully",
      order,
      payment,
    });
  } catch (error) {
    console.error("Verify Razorpay Payment Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};

/* =====================================================
   USER: GET MY PAYMENTS
===================================================== */
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("order", "totalPrice orderStatus")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get My Payments Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
};

/* =====================================================
   ADMIN: GET ALL PAYMENTS
===================================================== */
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email")
      .populate("order", "totalPrice orderStatus")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get All Payments Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
};
