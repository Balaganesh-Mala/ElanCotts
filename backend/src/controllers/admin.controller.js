import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Payment from "../models/payment.model.js";

export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, secretKey } = req.body;

  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    res.status(403);
    throw new Error("Invalid Admin Secret Key");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("Admin Already Exists");
  }

  const admin = await User.create({ name, email, password, role: "admin" });

  res.status(201).json({
    success: true,
    message: "Admin Created",
    admin: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
    token: admin.generateAuthToken(),
  });
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await User.findOne({ email, role: "admin" }).select("+password");

  if (!admin || !(await admin.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid Admin Credentials");
  }

  res.status(200).json({
    success: true,
    message: "Admin Login Success",
    admin: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
    token: admin.generateAuthToken(),
  });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: "user" });
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();

  const totalRevenue = await Payment.aggregate([
    { $match: { status: "Success" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: totalRevenue[0]?.total || 0,
    }
  });
});
