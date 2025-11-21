import { Router } from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { registerValidation, loginValidation } from "../middleware/validation";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

// Apply auth rate limiter to login and register
router.post("/register", authLimiter, registerValidation, register);
router.post("/login", authLimiter, loginValidation, login);
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);

export default router;
