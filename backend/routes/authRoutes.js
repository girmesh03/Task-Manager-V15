// backend/routes/authRoutes.js
import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  getRefreshToken,
} from "../controllers/authController.js";

import {
  rateLimiter,
  validateLogin,
  validateUserRegistration,
} from "../middlewares/index.js";

const router = express.Router();

// Apply rate limiter to all auth routes
router.use(rateLimiter);

// @route   POST /api/auth/register
// @desc    Register a new tenant, department and tenant super admin user
// @access  Public
router.route("/register").post(validateUserRegistration, registerUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.route("/login").post(validateLogin, loginUser);

// @route   DELETE /api/auth/logout
// @desc    Logout user
// @access  Public
router.route("/logout").delete(logoutUser);

// @route   GET /api/auth/refresh-token
// @desc    Get new access token using refresh token
// @access  Public
router.route("/refresh-token").get(getRefreshToken);

export default router;
