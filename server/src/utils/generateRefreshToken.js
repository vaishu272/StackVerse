import jwt from "jsonwebtoken";

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_REFRESH_SECRET || "refresh_secret",
    {
      expiresIn: "7d",
    }
  );
};

export default generateRefreshToken;
