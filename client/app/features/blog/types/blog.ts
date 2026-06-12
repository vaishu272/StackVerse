export type PostStatus = "DRAFT" | "PUBLISHED";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  htmlContent: string;
  category: string;
  coverImage?: string | null;
  excerpt: string;
  seoKeywords?: string | null;
  status: PostStatus;
  authorId: string;
  author: {
    id: string;
    name: string;
    role: string;
    avatar?: string | null;
  };
  createdAt: string;
}

export interface CreatePostInput {
  title: string;
  htmlContent: string;
  category: string;
  coverImage?: string;
  excerpt: string;
  seoKeywords?: string;
  status?: PostStatus;
}

export type UpdatePostInput = Partial<CreatePostInput>;
