import AbandonedCheckout from "../models/AbandonedCheckout.model.js";

export const startCheckout = async (req, res) => {
  try {
    const { phone, name, cartItems } = req.body;

    if (!phone || !cartItems?.length) {
      return res.status(400).json({ success: false });
    }

    const checkout = await AbandonedCheckout.create({
      user: req.user._id,
      phone,
      name,
      cartItems,
      status: "PENDING",
    });

    res.json({
      success: true,
      checkoutId: checkout._id,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
