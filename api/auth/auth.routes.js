import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  refreshAccessToken,
  forgotPasswordRequest,
  resetPassword,
  getCurrentUser,
  changeCurrentPassword,
  resendEmailVerification,
} from "./auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  userRegisterValidator,
  userLoginValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
  userChangeCurrentPasswordValidator,
} from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/* ========= UNSECURED ROUTES ========= */

// Register new user
router.post("/register", userRegisterValidator(), validate, registerUser);

// Login user
router.post("/login", userLoginValidator(), validate, loginUser);

// Verify email with token
router.get("/verify-email/:verificationToken", verifyEmail);

// Refresh access token (using refresh token)
router.post("/refresh-token", refreshAccessToken);

// Forgot password (request reset link)
router.post(
  "/forgot-password",
  userForgotPasswordValidator(),
  validate,
  forgotPasswordRequest
);

// Reset password using reset token
router.post(
  "/reset-password/:token",
  userResetForgotPasswordValidator(),
  validate,
  resetPassword
);

/* ========= SECURED ROUTES (require JWT) ========= */

// Logout
router.post("/logout", verifyJWT, logoutUser);

// Get current logged-in user
router.get("/me", verifyJWT, getCurrentUser);
router.get("/current-user", verifyJWT, getCurrentUser); // alias

// Change current password
router.post(
  "/change-password",
  verifyJWT,
  userChangeCurrentPasswordValidator(),
  validate,
  changeCurrentPassword
);

// Resend email verification link
router.post("/resend-email-verification", verifyJWT, resendEmailVerification);

export default router;
