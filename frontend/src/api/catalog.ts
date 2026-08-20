import { api } from './client';
import type { PaginatedProducts, Category, Branch } from '../types/catalog';

export const catalogApi = {
  listProducts: (params: { search?: string; categoryId?: number; page?: number }) =>
    api.get<PaginatedProducts>('/products', { params }).then((res) => res.data),

  listCategories: () => api.get<Category[]>('/categories').then((res) => res.data),

  listBranches: () => api.get<Branch[]>('/inventory/branches').then((res) => res.data)
};