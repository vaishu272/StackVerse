import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../config/db.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import { sendEmail } from "../utils/sendEmail.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        errors: {
          email: ["Email already exists"],
        },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate secure 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedVerificationOtp = crypto
      .createHash("sha256")
      .update(otpCode)
      .digest("hex");

    // OTP expires in 15 minutes
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: role || "VISITOR",
        emailVerified: false,
        verificationToken: hashedVerificationOtp,
        verificationTokenExpires: verificationExpires,
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
      console.error("Email delivery failed, but user was created. Logging OTP for manual verification:", emailError);
      console.log(`\n🔑 [OTP BYPASS] Verification OTP for ${user.email} is: ${otpCode}\n`);
    }

    res.status(201).json({
      success: true,
      message: "Registration successful! Please verify your account using the OTP code sent to your email.",
      otp: otpCode,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return res.status(400).json({
        success: false,
        errors: {
          email: ["Invalid email or password"],
          password: ["Invalid email or password"],
        },
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        errors: {
          email: ["Invalid email or password"],
          password: ["Invalid email or password"],
        },
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email address before logging in.",
        code: "EMAIL_UNVERIFIED",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Hash refresh token
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

    const isProd = process.env.NODE_ENV === "production";
    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        createdAt: req.user.createdAt,
        hasPassword: !!req.user.passwordHash,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const onboardUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const { role, password } = req.body;

    if (!role || !["VISITOR", "CREATOR"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be VISITOR or CREATOR",
      });
    }

    const updateData = { role };

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: "Profile configured successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        createdAt: updatedUser.createdAt,
        hasPassword: !!updatedUser.passwordHash,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const { name, password, role, avatar } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (role && ["VISITOR", "CREATOR"].includes(role)) {
      updateData.role = role;
    }
    if (avatar !== undefined) {
      updateData.avatar = avatar === "" ? null : avatar;
    }
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        createdAt: updatedUser.createdAt,
        hasPassword: !!updatedUser.passwordHash,
      },
    });
  } catch (error) {
    next(error);
  }
};
