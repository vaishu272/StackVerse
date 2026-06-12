import API from "@/shared/api/axios";
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "@/features/auth/types/auth";

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await API.post<AuthResponse>(
      "/auth/register",
      credentials,
    );
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await API.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await API.post("/auth/logout");
  },

  async refresh(): Promise<AuthResponse> {
    const response = await API.post<AuthResponse>("/auth/refresh");
    return response.data;
  },

  async verifyEmail(credentials: { email: string; otp: string }): Promise<{ success: boolean; message: string }> {
    const response = await API.post<{ success: boolean; message: string }>(
      "/auth/verify-email",
      credentials
    );
    return response.data;
  },

  async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    const response = await API.post<{ success: boolean; message: string }>(
      "/auth/resend-verification",
      { email }
    );
    return response.data;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await API.post<{ success: boolean; message: string }>(
      "/auth/forgot-password",
      { email }
    );
    return response.data;
  },

  async resetPassword(credentials: { email: string; otp: string; password: string }): Promise<{ success: boolean; message: string }> {
    const response = await API.post<{ success: boolean; message: string }>(
      "/auth/reset-password",
      credentials
    );
    return response.data;
  },

  async onboard(credentials: { role: string; password?: string }): Promise<AuthResponse> {
    const response = await API.put<AuthResponse>("/auth/onboard", credentials);
    return response.data;
  },

  async getMe(): Promise<AuthResponse> {
    const response = await API.get<AuthResponse>("/auth/me");
    return response.data;
  },

  async updateProfile(credentials: { name?: string; role?: string; password?: string; avatar?: string | null }): Promise<AuthResponse> {
    const response = await API.put<AuthResponse>("/auth/me", credentials);
    return response.data;
  },
};
