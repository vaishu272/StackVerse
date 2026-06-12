export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  createdAt?: string;
  hasPassword?: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  role?: string;
}

export interface AuthResponse {
  success?: boolean;
  message: string;
  token?: string;
  user: User;
}
