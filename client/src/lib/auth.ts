import { apiRequest } from './queryClient';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: User;
}

export const login = async (identifier: string, password: string): Promise<AuthResponse> => {
  const response = await apiRequest('POST', '/api/auth/login', { identifier, password });
  return response.json();
};

export const register = async (data: {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role?: string;
}): Promise<{ message: string; userId: number }> => {
  const response = await apiRequest('POST', '/api/auth/register', data);
  return response.json();
};

export const logout = async (): Promise<void> => {
  await apiRequest('POST', '/api/auth/logout');
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiRequest('GET', '/api/auth/me');
    const data = await response.json();
    return data.user;
  } catch (error) {
    return null;
  }
};

export const sendOtp = async (identifier: string, type: 'email' | 'mobile'): Promise<void> => {
  await apiRequest('POST', '/api/auth/send-otp', { identifier, type });
};

export const verifyOtp = async (identifier: string, type: 'email' | 'mobile', code: string): Promise<void> => {
  await apiRequest('POST', '/api/auth/verify-otp', { identifier, type, code });
};
