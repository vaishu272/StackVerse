import jwt from "jsonwebtoken";

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "access_secret",
    {
      expiresIn: "15m",
    }
  );
};

export default generateAccessToken;
