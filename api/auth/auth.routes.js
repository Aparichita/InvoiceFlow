import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  changeCurrentPassword,
  forgotPasswordRequest,
  resetPassword,
  refreshAccessToken,
} from "./auth.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/* ========= UNSECURED ROUTES ========= */
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPasswordRequest);
router.post("/reset-password/:token", resetPassword);
router.post("/refresh-token", refreshAccessToken);

/* ========= SECURED ROUTES ========= */
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);
router.post("/change-password", verifyJWT, changeCurrentPassword);

export default router;
