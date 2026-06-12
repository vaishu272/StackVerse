import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../config/db.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";

export const refreshSession = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    // Verify token structure and signature
    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || "refresh_secret"
      );
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    // Hash the incoming refresh token to match the database stored value
    const hashedRefreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Find the token in the database
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: hashedRefreshToken },
      include: { user: true },
    });

    // Reuse Detection: If the token is valid but not in the DB, or is marked as revoked,
    // it could indicate a reuse attack. Revoke all sessions for this user.
    if (!dbToken || dbToken.revoked || dbToken.expiresAt < new Date()) {
      const userId = decoded.id;
      if (userId) {
        // Delete all active refresh tokens for the compromised user
        await prisma.refreshToken.deleteMany({
          where: { userId },
        });
      }

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(403).json({
        success: false,
        message: "Refresh token is invalid or has been reused. All sessions terminated.",
      });
    }

    // Valid Refresh Token - Perform Token Rotation
    // 1. Delete the used refresh token from the database
    await prisma.refreshToken.delete({
      where: { id: dbToken.id },
    });

    const user = dbToken.user;
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Hash the new refresh token before storing it
    const hashedNewRefreshToken = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    // 2. Save the new refresh token in the database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.refreshToken.create({
      data: {
        token: hashedNewRefreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // 3. Set the new refresh token in HTTP-only cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      token: newAccessToken,
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
