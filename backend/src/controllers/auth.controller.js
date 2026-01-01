import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password, phone, role: "user" });

  res.status(201).json({
    success: true,
    message: "User Registered",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token: user.generateAuthToken(),
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid Credentials");
  }

  if (user.role !== "user") {
    res.status(403);
    throw new Error("Not authorized as user");
  }

  res.status(200).json({
    success: true,
    message: "User Login Success",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token: user.generateAuthToken(),
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User Not Found");
  }
  res.status(200).json({ success: true, user });
});
