import express from "express";
import {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getMyArticles,
  togglePostStatus,
  uploadImage,
} from "../controllers/post.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import checkRole from "../middleware/role.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import {
  createPostSchema,
  updatePostSchema,
} from "../validators/post.validation.js";

const router = express.Router();

// Public routes
router.get("/", getPosts);
router.get("/:slug", getPostBySlug);

// Protected routes (CREATOR roles only)
router.get("/my/articles", authMiddleware, checkRole("CREATOR"), getMyArticles);
router.post(
  "/",
  authMiddleware,
  checkRole("CREATOR"),
  validate(createPostSchema),
  createPost,
);
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadImage,
);
router.put(
  "/:id",
  authMiddleware,
  checkRole("CREATOR"),
  validate(updatePostSchema),
  updatePost,
);
router.delete("/:id", authMiddleware, checkRole("CREATOR"), deletePost);
router.patch(
  "/:id/status",
  authMiddleware,
  checkRole("CREATOR"),
  togglePostStatus,
);

export default router;

