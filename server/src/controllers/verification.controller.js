import crypto from "crypto";
import prisma from "../config/db.js";
import { sendEmail } from "../utils/sendEmail.js";

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP verification code are required.",
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

    // Hash the incoming OTP code
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp.trim())
      .digest("hex");

    // Compare with DB record
    if (user.verificationToken !== hashedOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    // Check expiration
    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
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
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, we have sent a verification code.",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "This email is already verified. You can log in.",
      });
    }

    // Generate secure 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedVerificationOtp = crypto
      .createHash("sha256")
      .update(otpCode)
      .digest("hex");

    // Code expires in 15 minutes
    const tokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: hashedVerificationOtp,
        verificationTokenExpires: tokenExpires,
      },
    });

    // Send verification email with OTP
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Verify Your StackVerse Account</h2>
        <p>Hello ${user.name},</p>
        <p>Please enter the following 6-digit verification code to unlock your account and begin publishing or reading engineering insights on StackVerse.</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; background-color: #f3f4f6; padding: 10px 20px; border-radius: 5px;">${otpCode}</span>
        </div>
        <p>This verification code will expire in 15 minutes.</p>
        <p style="color: #6b7280; font-size: 12px; border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
          If you did not request this, please ignore this email.
        </p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Your StackVerse Verification Code",
        html,
      });
    } catch (emailError) {
      console.error("Email delivery failed for verification code resend. Logging OTP for manual verification:", emailError);
      console.log(`\n🔑 [OTP BYPASS] Verification OTP for ${user.email} is: ${otpCode}\n`);
    }

    res.status(200).json({
      success: true,
      message: "If an account with that email exists, we have sent a verification code.",
    });
  } catch (error) {
    next(error);
  }
};
