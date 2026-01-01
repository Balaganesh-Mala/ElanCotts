import Order from "../models/order.model.js";
import { buildOrderFromCart } from "../services/order.service.js";

/* =====================================================
   CREATE ORDER (COD ONLY)
   Flow:
   Cart → Order → Stock reduce → Cart clear
===================================================== */
export const createCodOrder = async (req, res) => {
  try {
    const { shippingAddress, couponCode } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const order = await buildOrderFromCart({
      userId: req.user._id,
      shippingAddress,
      paymentMethod: "COD",
      couponCode,
    });

    res.status(201).json({
      success: true,
      message: "COD order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create COD Order Error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   GET MY ORDERS (USER)
===================================================== */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("orderItems.product", "name slug")
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

/* =====================================================
   GET SINGLE ORDER (USER)
===================================================== */
export const getMyOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("orderItems.product", "name slug")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

/* =====================================================
   ADMIN: GET ALL ORDERS
===================================================== */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

/* =====================================================
   ADMIN: UPDATE ORDER STATUS
   (Shipping / Delivered / Cancelled)
===================================================== */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "PLACED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = status;

    // Auto mark COD as paid when delivered
    if (status === "DELIVERED" && order.paymentMethod === "COD") {
      order.paymentStatus = "PAID";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

/* =====================================================
   ADMIN: DELETE ORDER (RARE / DANGEROUS)
===================================================== */
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
    });
  }
};
