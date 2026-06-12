import API from "@/shared/api/axios";
import { BlogPost, CreatePostInput, UpdatePostInput } from "@/features/blog/types/blog";

export const blogService = {
  async getPosts(
    category?: string,
    search?: string,
    page?: number,
    limit?: number
  ): Promise<{ success: boolean; posts: BlogPost[]; hasMore: boolean; totalCount: number }> {
    const params: Record<string, string | number> = {};
    if (category) params.category = category;
    if (search) params.search = search;
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const response = await API.get<{ success: boolean; posts: BlogPost[]; hasMore: boolean; totalCount: number }>("/posts", { params });
    return response.data;
  },

  async getPostBySlug(slug: string): Promise<BlogPost> {
    const response = await API.get<{ success: boolean; post: BlogPost }>(`/posts/${slug}`);
    return response.data.post;
  },

  async createPost(input: CreatePostInput): Promise<BlogPost> {
    const response = await API.post<{ success: boolean; post: BlogPost }>("/posts", input);
    return response.data.post;
  },

  async updatePost(id: string, input: UpdatePostInput): Promise<BlogPost> {
    const response = await API.put<{ success: boolean; post: BlogPost }>(`/posts/${id}`, input);
    return response.data.post;
  },

  async deletePost(id: string): Promise<void> {
    await API.delete(`/posts/${id}`);
  },

  async getMyArticles(): Promise<{ success: boolean; posts: BlogPost[] }> {
    const response = await API.get<{ success: boolean; posts: BlogPost[] }>("/posts/my/articles");
    return response.data;
  },

  async togglePostStatus(id: string): Promise<BlogPost> {
    const response = await API.patch<{ success: boolean; post: BlogPost }>(`/posts/${id}/status`);
    return response.data.post;
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await API.post<{ success: boolean; url: string }>("/posts/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.url;
  },
};

