import "dotenv/config";
import dns from "dns";

// Force Node.js to prefer IPv4 DNS resolution (prevents ENETUNREACH on IPv6-unsupported hosts like Render/Gmail)
dns.setDefaultResultOrder("ipv4first");

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import "./config/passport.js";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://stack-verse-silk.vercel.app"
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("StackVerse API Running");
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("Centralized Error Handler:", err);

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(err.extraDetails && { errors: err.extraDetails }),
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Trigger server reload to use the newly generated Prisma Client
