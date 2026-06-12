import express from "express";
import passport from "passport";
import crypto from "crypto";
import prisma from "../config/db.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import {
  registerUser,
  loginUser,
  getMe,
  onboardUser,
  updateProfile,
} from "../controllers/auth.controller.js";
import { refreshSession } from "../controllers/refreshToken.controller.js";
import { logoutUser } from "../controllers/logout.controller.js";
import {
  verifyEmail,
  resendVerification,
} from "../controllers/verification.controller.js";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/passwordReset.controller.js";
import { validate } from "../middleware/validation.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validation.js";

const router = express.Router();

// Local Registration & Login
router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/refresh", refreshSession);
router.post("/logout", logoutUser);

// Email Verification
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

// Password Reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Get User Profile
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateProfile);
router.put("/onboard", authMiddleware, onboardUser);

// OAuth Callback Handler
const handleOAuthCallback = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:3000"}/login?error=OAuthFailed`,
      );
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Hash refresh token for DB storage
    const hashedRefreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Save refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const isNew = user.isNew ? "true" : "false";
    // Redirect to client callback route with access token
    res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:3000"}/auth-callback?token=${accessToken}&new=${isNew}`,
    );
  } catch (error) {
    next(error);
  }
};

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:3000"}/login?error=GoogleOAuthFailed`,
  }),
  handleOAuthCallback,
);

// GitHub OAuth Routes
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"], session: false }),
);
router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:3000"}/login?error=GitHubOAuthFailed`,
  }),
  handleOAuthCallback,
);

export default router;
