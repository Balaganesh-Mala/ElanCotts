import express from "express";
import {
  registerAdmin,
  adminLogin,
  getDashboardStats
} from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", adminLogin);

router.get("/dashboard", protect, isAdmin, getDashboardStats);

export default router;
