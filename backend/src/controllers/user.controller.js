import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";

//
// 🧍‍♂️ Get all users (Admin only)
//
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json({ success: true, users });
});

//
// 👤 Get logged-in user profile
//
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({ success: true, user });
});

//
// ✏️ Update user profile
//
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
    },
  });
});

//
// 💖 Add to wishlist
//
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    res.status(400);
    throw new Error("Product ID required");
  }

  const user = await User.findById(req.user.id);
  const alreadyExists = user.wishlist.some(
    (id) => id.toString() === productId
  );

  if (alreadyExists) {
    res.status(400);
    throw new Error("Product already in wishlist");
  }

  user.wishlist.push(productId);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Added to wishlist",
    wishlist: user.wishlist,
  });
});

//
// 💔 Remove from wishlist
//
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user.id);

  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== productId
  );
  await user.save();

  res.status(200).json({
    success: true,
    message: "Removed from wishlist",
    wishlist: user.wishlist,
  });
});

//
// 🏠 Add or update address
//
export const updateAddress = asyncHandler(async (req, res) => {
  const { street, city, state, pincode, phone } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // If address array is empty, push new one; else update first
  if (user.addresses.length === 0) {
    user.addresses.push({ street, city, state, pincode, phone });
  } else {
    const addr = user.addresses[0];
    addr.street = street || addr.street;
    addr.city = city || addr.city;
    addr.state = state || addr.state;
    addr.pincode = pincode || addr.pincode;
    addr.phone = phone || addr.phone;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Address updated successfully",
    address: user.addresses[0],
  });
});
