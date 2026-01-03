import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { calculateCartTotals } from "../utils/cart.utils.js";

/* ================= ADD TO CART ================= */
export const addToCart = async (req, res) => {
  const { productId, variantSku, qty } = req.body;

  if (!productId || !variantSku || !qty) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  let matchedVariant = null;
  let matchedSize = null;

  for (const variant of product.variants) {
    const size = variant.sizes.find((s) => s.sku === variantSku);
    if (size) {
      matchedVariant = variant;
      matchedSize = size;
      break;
    }
  }

  if (!matchedVariant || !matchedSize) {
    return res.status(400).json({
      success: false,
      message: "Invalid variant SKU",
    });
  }

  if (matchedSize.stock < qty) {
    return res.status(400).json({
      success: false,
      message: "Insufficient stock",
    });
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
    });
  }

  const existingItem = cart.items.find(
    (item) => item.variantSku === variantSku
  );

  if (existingItem) {
    existingItem.qty += qty;
  } else {
    cart.items.push({
      product: productId,
      variantSku,
      qty,
      price: matchedSize.price,
    });
  }

  calculateCartTotals(cart);
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Item added to cart",
    cart,
  });
};


/* ================= GET CART ================= */
export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product", "name slug images");

  if (!cart) {
    return res.json({
      success: true,
      cart: null,
    });
  }

  res.json({
    success: true,
    cart,
  });
};


/* ================= UPDATE CART ITEM ================= */
export const updateCartItem = async (req, res) => {
  const { variantSku, qty } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  const item = cart.items.find((i) => i.variantSku === variantSku);
  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Item not found in cart",
    });
  }

  if (qty <= 0) {
    cart.items = cart.items.filter(
      (i) => i.variantSku !== variantSku
    );
  } else {
    item.qty = qty;
  }

  calculateCartTotals(cart);
  await cart.save();

  res.json({
    success: true,
    message: "Cart updated",
    cart,
  });
};


/* ================= REMOVE CART ITEM ================= */
export const removeCartItem = async (req, res) => {
  const { variantSku } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  cart.items = cart.items.filter(
    (item) => item.variantSku !== variantSku
  );

  calculateCartTotals(cart);
  await cart.save();

  res.json({
    success: true,
    message: "Item removed from cart",
    cart,
  });
};


/* ================= APPLY COUPON ================= */
export const applyCouponToCart = async (req, res) => {
  const { code } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new Error("Cart not found");

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) throw new Error("Invalid coupon");

  if (new Date(coupon.expiry) < new Date())
    throw new Error("Coupon expired");

  if (cart.itemsPrice < coupon.minCartValue)
    throw new Error(`Minimum ₹${coupon.minCartValue} required`);

  let discount = 0;

  if (coupon.type === "PERCENT") {
    discount = (cart.itemsPrice * coupon.value) / 100;
    if (coupon.maxDiscount)
      discount = Math.min(discount, coupon.maxDiscount);
  }

  if (coupon.type === "FLAT") {
    discount = coupon.value;
  }

  discount = Math.min(discount, cart.itemsPrice);

  cart.coupon = {
    code: coupon.code,
    discount,
  };

  calculateCartTotals(cart);
  await cart.save();

  res.json({ success: true, cart });
};


/* ================= CLEAR CART ================= */
export const clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });

  res.json({
    success: true,
    message: "Cart cleared",
  });
};

export const mergeGuestCart = async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No guest cart items provided",
    });
  }

  // 🔐 Get or create user cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
    });
  }

  for (const guestItem of items) {
    const { productId, variantSku, qty } = guestItem;

    if (!productId || !variantSku || !qty || qty <= 0) continue;

    // 🔍 Validate product & SKU
    const product = await Product.findById(productId);
    if (!product || !product.isActive) continue;

    let matchedSize = null;

    for (const variant of product.variants) {
      const size = variant.sizes.find((s) => s.sku === variantSku);
      if (size) {
        matchedSize = size;
        break;
      }
    }

    if (!matchedSize) continue;

    // 📦 Stock safety
    const safeQty = Math.min(qty, matchedSize.stock);
    if (safeQty <= 0) continue;

    // 🧺 Merge with existing cart item
    const existingItem = cart.items.find(
      (i) => i.variantSku === variantSku
    );

    if (existingItem) {
      existingItem.qty = Math.min(
        existingItem.qty + safeQty,
        matchedSize.stock
      );
    } else {
      cart.items.push({
        product: productId,
        variantSku,
        qty: safeQty,
        price: matchedSize.price, // snapshot
      });
    }
  }

  // ❌ Remove coupon (guest coupons not trusted)
  cart.coupon = undefined;

  // 🔢 Recalculate totals
  calculateCartTotals(cart);
  await cart.save();

  res.json({
    success: true,
    message: "Guest cart merged successfully",
    cart,
  });
};