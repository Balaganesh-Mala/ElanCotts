import crypto from "crypto";
import razorpay from "../config/razorpay.js";

import Cart from "../models/cart.model.js";
import Payment from "../models/payment.model.js";
import { buildOrderFromCart } from "../services/order.service.js";

/* =====================================================
   CREATE RAZORPAY ORDER (PREVIEW ONLY)
   - NO order creation
   - NO stock reduction
   - NO cart clear
===================================================== */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { couponCode } = req.body;

    /* 1️⃣ Ensure cart exists */
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    /* 2️⃣ Calculate final amount (PREVIEW MODE) */
    const preview = await buildOrderFromCart({
      userId: req.user._id,
      shippingAddress: {
        name: "PREVIEW",
        phone: "0000000000",
        street: "PREVIEW",
        city: "PREVIEW",
        state: "PREVIEW",
        pincode: "000000",
      },
      paymentMethod: "PREPAID",
      couponCode,
      previewOnly: true,
    });

    /* 3️⃣ Create Razorpay order */
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(preview.totalPrice * 100), // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    /* 4️⃣ Save payment record (CREATED) */
    const payment = await Payment.create({
      user: req.user._id,
      razorpayOrderId: razorpayOrder.id,
      amount: preview.totalPrice,
      status: "CREATED",
    });

    res.status(200).json({
      success: true,
      razorpayOrder,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Create Razorpay Order Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create Razorpay order",
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

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification data missing",
      });
    }

    /* ================= DUPLICATE PAYMENT CHECK ================= */
    const existingPayment = await Payment.findOne({
      razorpayPaymentId: razorpay_payment_id,
    }).populate("order");

    if (existingPayment) {
      return res.status(200).json({
        success: true,
        message: "Payment already processed",
        order: existingPayment.order,
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

    /* ================= BACKEND AMOUNT CHECK ================= */
    const preview = await buildOrderFromCart({
      userId: req.user._id,
      shippingAddress,
      paymentMethod: "PREPAID",
      couponCode,
      previewOnly: true,
    });

    /* ================= CREATE FINAL ORDER ================= */
    const order = await buildOrderFromCart({
      userId: req.user._id,
      shippingAddress,
      paymentMethod: "PREPAID",

      couponCode,
    });
    order.paymentStatus = "PAID";
    await order.save();
    /* ================= UPDATE PAYMENT ================= */
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        order: order._id,
        amount: order.totalPrice,
        status: "PAID",
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Payment verified & order placed successfully",
      order,
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
      .populate("order", "orderNo totalPrice orderStatus")
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
      .populate("order", "orderNo totalPrice orderStatus")
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
