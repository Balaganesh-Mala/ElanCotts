import mongoose from "mongoose";

const abandonedCheckoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    phone: String,
    name: String,

    cartItems: Array,
    couponCode: String,
    checkoutUrl: String,

    status: {
      type: String,
      enum: ["PENDING", "RECOVERED", "EXPIRED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "AbandonedCheckout",
  abandonedCheckoutSchema
);
