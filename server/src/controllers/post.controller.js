import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import cloudinary from "../utils/cloudinary.js";

// Helper function to create slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")           // Replace spaces with -
    .replace(/[^\w\-]+/g, "")        // Remove all non-word chars
    .replace(/\-\-+/g, "-")          // Replace multiple - with single -
    .replace(/^-+/, "")              // Trim - from start of text
    .replace(/-+$/, "");             // Trim - from end of text
};

// Generates a unique slug by checking database for duplicates
const generateUniqueSlug = async (title) => {
  let slug = slugify(title);
  if (!slug) {
    slug = "untitled-" + Math.floor(Math.random() * 10000);
  }
  let exists = await prisma.post.findUnique({ where: { slug } });
  let count = 1;
  while (exists) {
    exists = await prisma.post.findUnique({ where: { slug: `${slug}-${count}` } });
    if (!exists) {
      slug = `${slug}-${count}`;
      break;
    }
    count++;
  }
  return slug;
};

// GET /api/posts - Fetch all published articles with search, category tags, and pagination
export const getPosts = async (req, res, next) => {
  try {
    const { category, search, page, limit } = req.query;

    const where = {
      status: "PUBLISHED",
    };

    if (category && category !== "All") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { htmlContent: { contains: search, mode: "insensitive" } },
      ];
    }

    // Pagination parameters
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 6;
    const skip = (pageNum - 1) * limitNum;

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              role: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.post.count({ where }),
    ]);

    const hasMore = skip + posts.length < totalCount;

    res.status(200).json({
      success: true,
      posts,
      hasMore,
      totalCount,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/posts/:slug - Fetch single post by slug (open to public, previewable by author if draft)
export const getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // If draft, only creator author can view it
    if (post.status === "DRAFT") {
      let authorized = false;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer")) {
        const token = authHeader.split(" ")[1];
        try {
          const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET || "access_secret"
          );
          if (decoded.id === post.authorId) {
            authorized = true;
          }
        } catch (err) {
          // Token expired or invalid
        }
      }

      if (!authorized) {
        return res.status(404).json({
          success: false,
          message: "Article not found",
        });
      }
    }

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/posts - Create new article (CREATOR only)
export const createPost = async (req, res, next) => {
  try {
    const { title, htmlContent, category, coverImage, excerpt, seoKeywords, status } = req.body;
    const authorId = req.user.id;

    const slug = await generateUniqueSlug(title);

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        htmlContent,
        category,
        coverImage: coverImage || null,
        excerpt,
        seoKeywords: seoKeywords || null,
        status: status || "DRAFT",
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Article created successfully",
      post,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/posts/:id - Update existing article (CREATOR & Owner only)
export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, htmlContent, category, coverImage, excerpt, seoKeywords, status } = req.body;

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Ownership Verification
    if (post.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this article",
      });
    }

    // Prep data updates
    const updateData = {
      htmlContent,
      category,
      coverImage: coverImage === "" ? null : coverImage,
      excerpt,
      seoKeywords: seoKeywords || null,
      status,
    };

    // If title has changed, update slug
    if (title && title !== post.title) {
      updateData.title = title;
      updateData.slug = await generateUniqueSlug(title);
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Article updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/posts/:id - Delete article (CREATOR & Owner only)
export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Ownership Verification
    if (post.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this article",
      });
    }

    await prisma.post.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/posts/my/articles - Fetch all articles belonging to logged-in creator
export const getMyArticles = async (req, res, next) => {
  try {
    const authorId = req.user.id;

    const posts = await prisma.post.findMany({
      where: { authorId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/posts/:id/status - Toggle draft/published status (CREATOR & Owner only)
export const togglePostStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Ownership Verification
    if (post.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this article status",
      });
    }

    const nextStatus = post.status === "DRAFT" ? "PUBLISHED" : "DRAFT";

    const updatedPost = await prisma.post.update({
      where: { id },
      data: { status: nextStatus },
    });

    res.status(200).json({
      success: true,
      message: `Article status updated to ${nextStatus}`,
      post: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/posts/upload - Upload file to Cloudinary (CREATOR only)
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Upload memory buffer to Cloudinary using upload_stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "stackverse",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to upload image to Cloudinary",
          });
        }
        res.status(200).json({
          success: true,
          url: result.secure_url,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
};

