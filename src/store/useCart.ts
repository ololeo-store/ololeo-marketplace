import { create } from "zustand";
import { api, ApiCartItem } from "@/lib/api";

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

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("customer_token");
}

function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

function mapItems(items: ApiCartItem[]): CartItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    discountPrice: item.discountPrice,
    stock: item.stock,
    image: item.image,
    category: item.category,
    description: item.description,
    quantity: item.quantity,
  }));
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  setIsOpen: (isOpen: boolean) => void;
  fetchCart: () => Promise<void>;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  resetLocal: () => void;
  totalPrice: () => number;
  totalItems: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  isLoading: false,

  // Cart is per-account and lives on the server — a guest has nowhere to
  // open it, so route them to login instead of showing an empty drawer.
  setIsOpen: (isOpen) => {
    if (isOpen) {
      if (!getToken()) {
        redirectToLogin();
        return;
      }
      get().fetchCart();
    }
    set({ isOpen });
  },

  fetchCart: async () => {
    const token = getToken();
    if (!token) return;
    set({ isLoading: true });
    try {
      const cart = await api.getCart(token);
      set({ items: mapItems(cart.items) });
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (product, quantity = 1) => {
    const token = getToken();
    if (!token) {
      redirectToLogin();
      return;
    }
    try {
      const cart = await api.addCartItem(token, product.id, quantity);
      set({ items: mapItems(cart.items) });
    } catch (err) {
      console.error("Failed to add item to cart:", err);
    }
  },

  removeItem: async (id) => {
    const token = getToken();
    if (!token) return;
    try {
      const cart = await api.removeCartItem(token, id);
      set({ items: mapItems(cart.items) });
    } catch (err) {
      console.error("Failed to remove cart item:", err);
    }
  },

  updateQuantity: async (id, quantity) => {
    if (quantity < 1) {
      return get().removeItem(id);
    }
    const token = getToken();
    if (!token) return;
    try {
      const cart = await api.updateCartItem(token, id, quantity);
      set({ items: mapItems(cart.items) });
    } catch (err) {
      console.error("Failed to update cart item:", err);
    }
  },

  clearCart: async () => {
    const token = getToken();
    if (token) {
      try {
        await api.clearCart(token);
      } catch (err) {
        console.error("Failed to clear cart:", err);
      }
    }
    set({ items: [] });
  },

  // Wipes the local mirror without touching the server — used on logout so
  // the next guest on this device doesn't see the previous customer's cart.
  resetLocal: () => set({ items: [], isOpen: false }),

  totalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  totalItems: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
