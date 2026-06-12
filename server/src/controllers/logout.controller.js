import crypto from "crypto";
import prisma from "../config/db.js";

export const logoutUser = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Hash the refresh token to match the database stored value
      const hashedRefreshToken = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      // Delete the refresh token from the database
      try {
        await prisma.refreshToken.delete({
          where: { token: hashedRefreshToken },
        });
      } catch (err) {
        // Token might have already been deleted/expired, ignore database deletion error
      }
    }

    const isProd = process.env.NODE_ENV === "production";
    // Clear HTTP-only cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message: "Successfully logged out",
    });
  } catch (error) {
    next(error);
  }
};
