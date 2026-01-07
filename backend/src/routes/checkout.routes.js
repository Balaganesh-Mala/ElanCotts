import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { startCheckout } from "../controllers/checkout.controller.js";

const router = express.Router();

router.post("/start", protect, startCheckout);

export default router;
