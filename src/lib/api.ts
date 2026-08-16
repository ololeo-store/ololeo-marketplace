const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.ololeo-store.com/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((customHeaders as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    ...rest,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${res.status}`);
  }

  const json = await res.json();

  // NestJS wraps responses in { success, data, ... }
  if (json.data !== undefined) {
    return json.data;
  }

  return json;
}

// ─── Product Types ──────────────────────────────────────

export interface ApiProductGallery {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

export interface ApiProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  updatedAt: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: string | number;
  discountPrice?: string | number | null;
  stock: number;
  isActive: boolean;
  category: ApiProductCategory;
  galleries: ApiProductGallery[];
  createdAt: string;
  updatedAt: string;
}

// ─── CMS Types ───────────────────────────────────────────

export interface ApiCmsTag {
  id: string;
  name: string;
  slug: string;
  updatedAt: string;
}

export interface ApiCmsPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  publishedAt: string | null;
  updatedAt: string;
  category: { id: string; name: string; slug: string; section: string };
  tags: { id: string; name: string; slug: string }[];
}

// ─── Discount Types ─────────────────────────────────────

export interface ApiActiveDiscount {
  code: string;
  name: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Auth Types ─────────────────────────────────────────

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  customer: CustomerProfile;
  accessToken: string;
  access_token: string;
  refreshToken: string;
  refresh_token: string;
}

// ─── API Functions ──────────────────────────────────────

export const api = {
  // Products
  getProducts: (params?: { page?: number; limit?: number; search?: string; categoryId?: string; excludeId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.excludeId) searchParams.set('excludeId', params.excludeId);
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<ApiProduct>>(`/public/products${qs ? `?${qs}` : ''}`);
  },

  getProduct: (id: string) => {
    return apiFetch<ApiProduct>(`/public/products/${id}`);
  },

  // Categories
  getCategories: () => {
    return apiFetch<ApiProductCategory[]>('/public/product-categories');
  },

  // CMS
  getCmsPosts: (params?: { page?: number; limit?: number; section?: string; tagId?: string; categoryId?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.section) searchParams.set('section', params.section);
    if (params?.tagId) searchParams.set('tagId', params.tagId);
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.search) searchParams.set('search', params.search);
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<ApiCmsPost>>(`/public/cms-posts${qs ? `?${qs}` : ''}`);
  },

  getCmsPostBySlug: (slug: string) => {
    return apiFetch<ApiCmsPost>(`/public/cms-posts/${slug}`);
  },

  getCmsTags: () => {
    return apiFetch<ApiCmsTag[]>('/public/cms-tags');
  },

  // Customer Auth
  register: (data: { name: string; email: string; password: string; phone?: string }) => {
    return apiFetch<AuthResponse>('/public/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: (data: { email: string; password: string }) => {
    return apiFetch<AuthResponse>('/public/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMe: (token: string) => {
    return apiFetch<CustomerProfile>('/public/auth/me', { token });
  },

  // Discounts
  getActiveDiscount: () => {
    return apiFetch<ApiActiveDiscount | null>('/public/discounts/active');
  },
};
