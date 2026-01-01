import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Coupon from "../models/Coupon.model.js";

export const buildOrderFromCart = async ({
  userId,
  shippingAddress,
  paymentMethod,
  couponCode,
}) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // 🔒 Stock validation
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    const variant = product.variants.find(
      (v) => v.sku === item.variantSku
    );
    if (!variant || variant.stock < item.qty) {
      throw new Error(`Insufficient stock for ${item.variantSku}`);
    }
  }

  // 🎟 Coupon
  let discount = 0;
  let coupon = null;

  if (couponCode) {
    const c = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    });

    if (!c) throw new Error("Invalid coupon");
    if (new Date(c.expiry) < new Date()) throw new Error("Coupon expired");
    if (cart.itemsPrice < c.minCartValue)
      throw new Error(`Minimum cart value ₹${c.minCartValue}`);

    if (c.type === "PERCENT") {
      discount = (cart.itemsPrice * c.value) / 100;
      if (c.maxDiscount)
        discount = Math.min(discount, c.maxDiscount);
    } else {
      discount = c.value;
    }

    discount = Math.min(discount, cart.itemsPrice);
    coupon = { code: c.code, discount };
  }

  // 🧾 Create Order
  const order = await Order.create({
    user: userId,
    orderItems: cart.items.map((i) => ({
      product: i.product,
      variantSku: i.variantSku,
      name: i.product.name,
      price: i.price,
      qty: i.qty,
    })),
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentMethod === "COD" ? "PENDING" : "PAID",
    itemsPrice: cart.itemsPrice,
    discountPrice: discount,
    totalPrice: cart.itemsPrice - discount,
    coupon,
  });

  // 📉 Reduce stock
  for (const item of cart.items) {
    await Product.updateOne(
      { _id: item.product, "variants.sku": item.variantSku },
      { $inc: { "variants.$.stock": -item.qty } }
    );
  }

  await Cart.deleteOne({ user: userId });

  return order;
};
