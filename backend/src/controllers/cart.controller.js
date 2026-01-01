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

  const variant = product.variants.find(
    (v) => v.sku === variantSku && v.isActive
  );

  if (!variant) {
    return res.status(400).json({
      success: false,
      message: "Invalid variant",
    });
  }

  if (variant.stock < qty) {
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
      price: variant.price,
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
  const { code, discount } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  cart.coupon = { code, discount };
  calculateCartTotals(cart);

  await cart.save();

  res.json({
    success: true,
    message: "Coupon applied",
    cart,
  });
};


/* ================= CLEAR CART ================= */
export const clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });

  res.json({
    success: true,
    message: "Cart cleared",
  });
};
