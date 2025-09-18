// api/auth/auth.controller.js
import asyncHandler from "../utils/async-handler.js";
import User from "../models/user.model.js"; // adjust path if needed
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import jwt from "jsonwebtoken";

// ======================= REGISTER =======================
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists" });
  }

  const user = await User.create({ username, email, password });
  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: { id: user._id, username: user.username, email: user.email },
  });
});

// ======================= LOGIN =======================
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });
  }

  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user) throw new ApiError(400, "Invalid credentials");

  const isValid = await user.isPasswordCorrect(password);
  if (!isValid) throw new ApiError(400, "Invalid credentials");

  // Generate new tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .cookie("accessToken", accessToken, { httpOnly: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true })
    .json({
      success: true,
      message: "Login successful",
      data: { id: user._id, username: user.username, email: user.email },
    });
});

// ======================= LOGOUT =======================
export const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (user) {
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
  }
  return res.status(200).json({ success: true, message: "User logged out" });
});

// ======================= GET CURRENT USER =======================
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(401, "Unauthorized");
  return res.status(200).json({ success: true, data: user });
});

// ======================= CHANGE PASSWORD =======================
export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  const isValid = await user.isPasswordCorrect(oldPassword);
  if (!isValid) throw new ApiError(400, "Invalid old password");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({ success: true, message: "Password changed" });
});

// ======================= FORGOT PASSWORD =======================
export const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If email exists, reset instructions sent",
    });
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  console.log("Reset token for testing:", resetToken);

  return res.status(200).json({
    success: true,
    message: "Password reset instructions sent",
    resetToken,
  });
});

// ======================= RESET PASSWORD =======================
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  if (!token || !newPassword)
    throw new ApiError(400, "Token and password required");

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) throw new ApiError(400, "Invalid or expired reset token");

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return res
    .status(200)
    .json({ success: true, message: "Password reset successfully" });
});

// ======================= VERIFY EMAIL =======================
export const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({
    emailVerificationToken: verificationToken,
  });
  if (!user) throw new ApiError(400, "Invalid or expired token");

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();

  return res
    .status(200)
    .json({ success: true, message: "Email verified successfully" });
});

// ======================= RESEND EMAIL VERIFICATION =======================
export const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.isEmailVerified) throw new ApiError(400, "Email already verified");

  const newToken = user.generateEmailVerificationToken();
  user.emailVerificationToken = newToken;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json({ success: true, message: "Verification email resent" });
});

// ======================= REFRESH ACCESS TOKEN =======================
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!incomingToken) throw new ApiError(401, "Unauthorized");

  try {
    const decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("+refreshToken");
    if (!user || incomingToken !== user.refreshToken)
      throw new ApiError(401, "Invalid token");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .cookie("accessToken", accessToken, { httpOnly: true })
      .cookie("refreshToken", refreshToken, { httpOnly: true })
      .json({
        success: true,
        message: "Token refreshed",
        accessToken,
        refreshToken,
      });
  } catch (err) {
    throw new ApiError(401, "Invalid refresh token");
  }
});
