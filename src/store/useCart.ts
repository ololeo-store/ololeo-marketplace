import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  stock?: number;
  image: string;
  category: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalItems: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id);
          if (existing) {
            const limit = existing.stock ?? Infinity;
            const capped = Math.min(existing.quantity + quantity, limit);
            return {
              items: state.items.map((item) =>
                item.id === product.id ? { ...item, quantity: capped } : item
              ),
            };
          }
          const limit = product.stock ?? Infinity;
          const capped = Math.min(Math.max(1, quantity), Math.max(1, limit));
          return { items: [...state.items, { ...product, quantity: capped }] };
        });
      },
      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.min(Math.max(1, quantity), Math.max(1, item.stock ?? Infinity)) }
              : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      totalItems: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "ololeo-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

