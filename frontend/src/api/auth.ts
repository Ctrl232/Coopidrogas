import { api } from './client';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth';

export const authApi = {
  login: (payload: LoginPayload) => api.post<AuthResponse>('/auth/login', payload).then((res) => res.data),

  register: (payload: RegisterPayload) => api.post<AuthResponse>('/auth/register', payload).then((res) => res.data),

  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
};