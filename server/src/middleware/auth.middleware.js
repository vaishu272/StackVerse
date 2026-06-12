import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check Authorization Header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // No token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || "access_secret",
      );

      // Find user
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          code: "TOKEN_EXPIRED",
          message: "Token expired",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
