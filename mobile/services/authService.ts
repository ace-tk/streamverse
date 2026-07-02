import api from './api';
import { AuthResponse, AuthUser, LoginRequest, SignupRequest } from '@/types';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<AuthUser> => {
    const response = await api.post<AuthUser>('/auth/signup', data);
    return response.data;
  },
};
