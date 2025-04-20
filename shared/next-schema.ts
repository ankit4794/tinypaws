import { z } from 'zod';

// Define user roles enum
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
  MANAGER = 'MANAGER',
  EDITOR = 'EDITOR'
}

// Widget types
export enum WidgetType {
  SALES_SUMMARY = 'sales-summary',
  RECENT_ORDERS = 'recent-orders',
  LOW_STOCK = 'low-stock',
  TOP_PRODUCTS = 'top-products',
  ORDER_STATUS = 'order-status',
  QUICK_STATS = 'quick-stats',
  REVENUE_CHART = 'revenue-chart',
  HELP_DESK = 'help-desk',
  ACTIVITY_LOG = 'activity-log',
  CATEGORY_DISTRIBUTION = 'category-distribution'
}

// Define basic types for client-side use
export type User = {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  mobile?: string;
  address?: any;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  parentId?: string;
  description?: string;
  image?: string;
  isActive: boolean;
  type?: string;
  forPet?: string;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Brand = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo: string;
  bannerImage?: string;
  featured: boolean;
  discount: {
    type: 'flat' | 'percentage' | 'none';
    value: number;
    label?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductVariant = {
  _id: string;
  name: string;
  sku: string;
  price: number;
  originalPrice?: number;
  stock: number;
  weight?: number;
  weightUnit?: 'g' | 'kg';
  packSize?: number;
  isDefault: boolean;
  isActive: boolean;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  features: string[];
  category: string | Category;
  brand?: string | Brand;
  ageGroup?: string;
  stock: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  hasVariants: boolean;
  variantType: 'weight' | 'pack' | 'none';
  variants: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
};

export type WidgetPosition = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Widget = {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  settings?: any;
  isVisible: boolean;
};

export type DashboardConfig = {
  _id: string;
  userId: string;
  widgets: Widget[];
  lastModified: Date;
  createdAt: Date;
  updatedAt: Date;
};

// Zod schemas for validation
export const userSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
  mobile: z.string().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
  mobile: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  parentId: z.string().optional().nullable(),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
  type: z.string().optional(),
  forPet: z.string().optional(),
  displayOrder: z.number().default(0),
});

export const brandSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  description: z.string().optional(),
  logo: z.string(),
  bannerImage: z.string().optional(),
  featured: z.boolean().default(false),
  discount: z.object({
    type: z.enum(['flat', 'percentage', 'none']).default('none'),
    value: z.number().default(0),
    label: z.string().optional(),
  }),
  isActive: z.boolean().default(true),
});

export const productVariantSchema = z.object({
  name: z.string(),
  sku: z.string(),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  stock: z.number().default(0),
  weight: z.number().optional(),
  weightUnit: z.enum(['g', 'kg']).optional(),
  packSize: z.number().optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const productSchema = z.object({
  name: z.string().min(3).max(200),
  slug: z.string().min(3).max(200),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  images: z.array(z.string()),
  features: z.array(z.string()),
  category: z.string(),
  brand: z.string().optional(),
  ageGroup: z.string().optional().nullable(),
  stock: z.number().default(0),
  isActive: z.boolean().default(true),
  hasVariants: z.boolean().default(false),
  variantType: z.enum(['weight', 'pack', 'none']).default('none'),
  variants: z.array(productVariantSchema).default([]),
});