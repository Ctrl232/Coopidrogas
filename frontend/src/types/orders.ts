import type { Branch } from './catalog';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product: { id: string; name: string; sku: string };
}

export interface Order {
  id: string;
  status: 'PENDIENTE' | 'CONFIRMADO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO';
  total: string;
  branch: Branch;
  items: OrderItem[];
  createdAt: string;
}

export interface CreateOrderPayload {
  branchId: number;
  items: { productId: string; quantity: number }[];
}