import { api } from './client';
import type { Order, CreateOrderPayload } from '../types/orders';

export const ordersApi = {
  create: (payload: CreateOrderPayload) => api.post<Order>('/orders', payload).then((res) => res.data),

  getById: (id: string) => api.get<Order>(`/orders/${id}`).then((res) => res.data),

  listMine: () => api.get<{ items: Order[] }>('/orders').then((res) => res.data),
};