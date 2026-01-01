import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1️⃣ Extract token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not Authorized, Token Missing ❌");
  }

  // 2️⃣ Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3️⃣ Find user in DB
  const user = await User.findById(decoded.id);
  if (!user) {
    res.status(404);
    throw new Error("User Not Found");
  }

  // 4️⃣ Attach mongo user to request
  req.user = user;  // ✅ Now `req.user._id` works in cart & order

  next();
});
