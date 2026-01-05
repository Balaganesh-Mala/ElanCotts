import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variantSku: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      required: true,
    },

    size: {
      type: String,
      required: true,
    },

    mrp: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    qty: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    orderItems: [orderItemSchema],
    orderNo: {
      type: String,
      unique: true,
      index: true,
    },
    tax: {
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    userEmail: {
      type: String,
      required: true,
    },

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

orderSchema.pre("save", async function (next) {
  if (!this.orderNo) {
    this.orderNo = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
  next();
});

export default mongoose.model("Order", orderSchema);
