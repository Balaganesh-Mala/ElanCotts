import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Coupon from "../models/Coupon.model.js";
import User from "../models/user.model.js";
/* ==========================================================
   BUILD ORDER FROM CART
   - previewOnly = true  → ONLY calculate price (NO DB write)
   - previewOnly = false → Create order + reduce stock + clear cart
========================================================== */
export const buildOrderFromCart = async ({
  userId,
  shippingAddress,
  paymentMethod,
  couponCode,
  previewOnly = false,
}) => {
  /* ================= CART ================= */
  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "name variants"
  );

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  /* ================= ITEMS PRICE ================= */
  const itemsPrice = cart.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  /* ================= STOCK VALIDATION ================= */
  for (const item of cart.items) {
    const product = item.product;
    if (!product) throw new Error("Product not found");

    let matchedSize = null;

    for (const variant of product.variants) {
      const size = variant.sizes.find((s) => s.sku === item.variantSku);
      if (size) {
        matchedSize = size;
        break;
      }
    }

    if (!matchedSize) {
      throw new Error(`Invalid SKU ${item.variantSku}`);
    }

    if (matchedSize.stock < item.qty) {
      throw new Error(`Insufficient stock for ${item.variantSku}`);
    }
  }

  /* ================= COUPON ================= */
  let discount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    });

    if (!coupon) throw new Error("Invalid coupon");
    if (new Date(coupon.expiry) < new Date()) throw new Error("Coupon expired");
    if (itemsPrice < coupon.minCartValue)
      throw new Error(`Minimum cart value ₹${coupon.minCartValue} required`);

    if (coupon.type === "PERCENT") {
      discount = (itemsPrice * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.value;
    }

    discount = Math.min(discount, itemsPrice);
    appliedCoupon = {
      code: coupon.code,
      discount,
    };
  }

  /* ================= TAX ================= */
  const CGST_RATE = 0.025;
  const SGST_RATE = 0.025;

  const taxableAmount = itemsPrice - discount;

  const cgst = Number((taxableAmount * CGST_RATE).toFixed(2));
  const sgst = Number((taxableAmount * SGST_RATE).toFixed(2));
  const totalTax = Number((cgst + sgst).toFixed(2));

  const totalPrice = Number((taxableAmount + totalTax).toFixed(2));

  /* ================= PREVIEW MODE ================= */
  if (previewOnly) {
    return {
      itemsPrice,
      discount,
      tax: {
        cgst,
        sgst,
        total: totalTax,
      },
      totalPrice,
      coupon: appliedCoupon,
    };
  }
  /* ================= USER SNAPSHOT ================= */
  const user = await User.findById(userId).select("email");

  if (!user) {
    throw new Error("User not found");
  }

  /* ================= CREATE ORDER ================= */
  const order = await Order.create({
    user: userId,
    userEmail: user.email,

    orderItems: cart.items.map((item) => ({
      product: item.product._id,
      variantSku: item.variantSku,

      name: item.product.name,
      image: item.image,
      color: item.color,
      size: item.size,

      mrp: item.mrp,
      price: item.price,
      qty: item.qty,
    })),

    shippingAddress,

    paymentMethod,
    paymentStatus: "PENDING",

    itemsPrice,
    discountPrice: discount,

    tax: {
      cgst,
      sgst,
      total: totalTax,
    },

    totalPrice,
    coupon: appliedCoupon,
  });

  /* ================= REDUCE STOCK ================= */
  for (const item of cart.items) {
    await Product.updateOne(
      {
        _id: item.product._id,
        "variants.sizes.sku": item.variantSku,
      },
      {
        $inc: {
          "variants.$[].sizes.$[size].stock": -item.qty,
        },
      },
      {
        arrayFilters: [{ "size.sku": item.variantSku }],
      }
    );
  }

  /* ================= CLEAR CART ================= */
  await Cart.deleteOne({ user: userId });

  return order;
};
