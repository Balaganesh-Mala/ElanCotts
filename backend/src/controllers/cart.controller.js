import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { calculateCartTotals } from "../utils/cart.utils.js";

/* ================= ADD TO CART ================= */
export const addToCart = async (req, res) => {
  try {
    const { productId, variantSku, qty } = req.body;

    /* ================= BASIC VALIDATION ================= */
    if (!productId || !variantSku || !qty) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    /* ================= GET PRODUCT ================= */
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /* ================= FIND VARIANT + SIZE ================= */
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
        message: "Invalid product variant",
      });
    }
/* ================= HARD VALIDATION ================= */
    if (
      !matchedVariant.color ||
      !matchedVariant.images?.[0]?.url ||
      !matchedSize.size ||
      matchedSize.mrp == null ||
      matchedSize.price == null
    ) {
      return res.status(400).json({
        success: false,
        message: "Product configuration invalid. Contact admin.",
      });
    }

    /* ================= GET / CREATE CART ================= */
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    } else {
      // 🔥 FORCE CLEAN INVALID ITEMS
      cart.items = [];
    }

    /* ================= REMOVE EXISTING ITEM ================= */
    cart.items = cart.items.filter((item) => item.variantSku !== variantSku);

    /* ================= PUSH CLEAN ITEM ================= */
    cart.items.push({
      product: productId,
      variantSku,
      qty,
      price: Number(matchedSize.price),
      mrp: Number(matchedSize.mrp),
      size: matchedSize.size.trim(),
      color: matchedVariant.color.trim(),
      image: matchedVariant.images[0].url,
    });

    /* ================= TOTALS ================= */
    calculateCartTotals(cart);

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    console.error("🔥 Add to Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
    });
  }
};

/* ================= GET CART ================= */
export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name slug"
  );

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
    cart.items = cart.items.filter((i) => i.variantSku !== variantSku);
  } else {
    // 🔍 re-check stock
    const product = await Product.findById(item.product);

    let matchedSize;
    for (const variant of product.variants) {
      const size = variant.sizes.find((s) => s.sku === variantSku);
      if (size) {
        matchedSize = size;
        break;
      }
    }

    if (!matchedSize || qty > matchedSize.stock) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

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
  try {
    const variantSku = decodeURIComponent(req.params.variantSku);

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const initialLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) => item.variantSku !== variantSku
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    calculateCartTotals(cart);
    await cart.save();

    res.json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    console.error("❌ Remove Cart Item Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item",
    });
  }
};


/* ================= CLEAR CART ================= */
export const clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });

  res.json({
    success: true,
    message: "Cart cleared",
  });
};
