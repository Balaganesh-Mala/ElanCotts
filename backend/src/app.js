import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import errorHandler from "./middleware/errorHandler.js";

import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import authRoutes from "./routes/auth.routes.js"; // ✅ User register/login routes
import adminRoutes from "./routes/admin.routes.js"; // ✅ Admin register/login routes
import categoryRoutes from "./routes/category.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import heroRoutes from "./routes/hero.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import userRoutes from "./routes/user.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import videoRoutes from "./routes/video.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js"

dotenv.config();

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Mount Routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/auth", authRoutes); 
app.use("/api/users", userRoutes);    
app.use("/api/admin", adminRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/checkout", checkoutRoutes);


// ✅ Test Route
app.get("/", (req, res) => {
  res.send("E-commerce API is running...");
});

// ✅ Global Error Handler
app.use(errorHandler);

export default app;
