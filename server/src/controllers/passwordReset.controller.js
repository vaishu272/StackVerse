import crypto from "crypto";
import bcrypt from "bcrypt";
import prisma from "../config/db.js";
import { sendEmail } from "../utils/sendEmail.js";

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        errors: {
          email: ["Email is required."],
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return 200 generic message to prevent user enumeration
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, we have sent a password reset OTP.",
      });
    }

    // Generate a secure 6-digit password reset OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedResetOtp = crypto
      .createHash("sha256")
      .update(otpCode)
      .digest("hex");

    // OTP expires in 15 minutes
    const tokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedResetOtp,
        resetPasswordTokenExpires: tokenExpires,
      },
    });

    // Send reset password email with OTP
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Reset Your StackVerse Password</h2>
        <p>Hello ${user.name},</p>
        <p>You requested a password reset for your StackVerse account. Please enter the following 6-digit OTP code on the reset page to choose a new password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; background-color: #f3f4f6; padding: 10px 20px; border-radius: 5px;">${otpCode}</span>
        </div>
        <p>This password reset OTP will expire in 15 minutes.</p>
        <p style="color: #6b7280; font-size: 12px; border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
          If you did not request a password reset, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Reset your StackVerse password",
      html,
    });

    res.status(200).json({
      success: true,
      message: "If an account with that email exists, we have sent a password reset link.",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP code, and new password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        errors: {
          password: ["Password must be at least 8 characters long."],
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid request or user not found.",
      });
    }

    // Hash the incoming raw OTP to compare
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp.trim())
      .digest("hex");

    if (user.resetPasswordToken !== hashedOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid password reset code.",
      });
    }

    // Check if token has expired
    if (user.resetPasswordTokenExpires && user.resetPasswordTokenExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Password reset code has expired.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user record, clearing reset token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpires: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully! You can now log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};
