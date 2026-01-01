import asyncHandler from "express-async-handler";
import Coupon from "../models/Coupon.model.js";

/* ================= CREATE COUPON (ADMIN) ================= */
export const createCoupon = asyncHandler(async (req, res) => {
  let { code, type, value, minCartValue, maxDiscount, expiry } = req.body;

  if (value <= 0) {
    res.status(400);
    throw new Error("Coupon value must be greater than zero");
  }

  const normalizedCode = code.toUpperCase();

  const exists = await Coupon.findOne({ code: normalizedCode });
  if (exists) {
    res.status(400);
    throw new Error("Coupon already exists");
  }

  const coupon = await Coupon.create({
    code: normalizedCode,
    type,
    value,
    minCartValue,
    maxDiscount,
    expiry,
  });

  res.status(201).json({
    success: true,
    coupon,
  });
});

/* ================= GET ALL COUPONS (ADMIN) ================= */
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    coupons,
  });
});

/* ================= APPLY COUPON (CHECKOUT) ================= */
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    res.status(400);
    throw new Error("Invalid coupon code");
  }

  if (new Date(coupon.expiry) < new Date()) {
    res.status(400);
    throw new Error("Coupon expired");
  }

  if (cartTotal < coupon.minCartValue) {
    res.status(400);
    throw new Error(`Minimum cart value ₹${coupon.minCartValue} required`);
  }

  let discount = 0;

  if (coupon.type === "PERCENT") {
    discount = (cartTotal * coupon.value) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  }

  if (coupon.type === "FLAT") {
    discount = coupon.value;
  }

  discount = Math.min(discount, cartTotal);

  res.json({
    success: true,
    coupon: {
      code: coupon.code,
      discount,
    },
  });
});

/* ================= UPDATE COUPON (ADMIN) ================= */
export const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { code, type, value, minCartValue, maxDiscount, expiry, isActive } =
    req.body;

  const coupon = await Coupon.findById(id);

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  if (value !== undefined && value <= 0) {
    res.status(400);
    throw new Error("Coupon value must be greater than zero");
  }

  // Prevent duplicate coupon codes
  if (code && code.toUpperCase() !== coupon.code) {
    const exists = await Coupon.findOne({
      code: code.toUpperCase(),
      _id: { $ne: id },
    });

    if (exists) {
      res.status(400);
      throw new Error("Coupon code already exists");
    }

    coupon.code = code.toUpperCase();
  }

  if (type) coupon.type = type;
  if (value !== undefined) coupon.value = value;
  if (minCartValue !== undefined) coupon.minCartValue = minCartValue;
  if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
  if (expiry) coupon.expiry = expiry;
  if (isActive !== undefined) coupon.isActive = isActive;

  await coupon.save();

  res.json({
    success: true,
    message: "Coupon updated successfully",
    coupon,
  });
});

/* ================= ACTIVE ANNOUNCEMENT (PUBLIC) ================= */
export const getActiveAnnouncement = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({
    isActive: true,
    expiry: { $gte: new Date() },
  }).sort({ createdAt: -1 });

  if (!coupon) {
    return res.json({
      success: true,
      data: null,
    });
  }

  let announcementText = "";
  let discountValue = 0;
  let discountType = coupon.type;

  if (coupon.type === "FLAT") {
    discountValue = coupon.value;
    announcementText = `₹${coupon.value} OFF`;
  }

  if (coupon.type === "PERCENT") {
    discountValue = coupon.value; // percentage
    announcementText = `${coupon.value}% OFF`;
  }

  res.json({
    success: true,
    data: {
      minCartValue: coupon.minCartValue,
      discount: discountValue,
      couponCode: coupon.code,
      couponType:coupon.type,
    },
  });
});

/* ================= DELETE COUPON (ADMIN) ================= */
export const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id);

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  await coupon.deleteOne();

  res.json({
    success: true,
    message: "Coupon deleted successfully",
  });
});
