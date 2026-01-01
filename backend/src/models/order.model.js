import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    variantSku: String,
    name: String,
    price: Number,
    qty: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    orderItems: [orderItemSchema],

    shippingAddress: {
      name: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "PREPAID"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },

    itemsPrice: Number,
    discountPrice: Number,
    totalPrice: Number,

    coupon: {
      code: String,
      discount: Number,
    },

    orderStatus: {
      type: String,
      enum: ["PLACED", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PLACED",
    },

    /* 🚚 Shiprocket placeholder */
    shiprocket: {
      orderId: String,
      shipmentId: String,
      awbCode: String,
      courierName: String,
      status: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
