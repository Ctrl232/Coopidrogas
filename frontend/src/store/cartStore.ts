import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types/catalog';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((item) => item.product.id === product.id);
          if (existing) {
            // Ya está en el carrito -> solo sumamos cantidad
            return {
              items: state.items.map((item) =>
                item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
              ),
            };
          }
          return { items: [...state.items, { product, quantity: 1 }] };
        }),

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((item) => item.product.id !== productId) })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
        })),

      clear: () => set({ items: [] }),

      total: () => get().items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0),
    }),
    { name: 'coopidrogas-cart' },
  ),
);