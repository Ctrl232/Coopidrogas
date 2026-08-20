export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: string;
  categoryId: number;
  category: Category;
  isActive: boolean;
}

export interface PaginatedProducts {
  items: Product[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}
export interface Branch {
  id: number;
  name: string;
  address: string;
}