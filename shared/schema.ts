import mongoose from 'mongoose';
import { z } from 'zod';

// Define user roles enum
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

// Define order status enum
export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

// ==================== USER SCHEMA ====================
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: String,
  mobile: String,
  address: mongoose.Schema.Types.Mixed,
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
}, { timestamps: true });

// ==================== CATEGORY SCHEMA ====================
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  description: String,
  image: String,
  isActive: { type: Boolean, default: true },
  type: { type: String, enum: ['shop_for', 'accessories', 'brands', 'age'] },
}, { timestamps: true });

// ==================== PRODUCT SCHEMA ====================
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  longDescription: String,
  price: { type: Number, required: true },
  originalPrice: Number,
  images: [String],
  features: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: String,
  ageGroup: String,
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// ==================== CART ITEM SCHEMA ====================
const cartItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
  selectedColor: String,
  selectedSize: String,
}, { timestamps: true });

// ==================== WISHLIST ITEM SCHEMA ====================
const wishlistItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true });

// ==================== ORDER SCHEMA ====================
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' }],
  total: { type: Number, required: true },
  status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
  paymentMethod: { type: String, required: true },
  shippingAddress: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

// ==================== ORDER ITEM SCHEMA ====================
const orderItemSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  selectedColor: String,
  selectedSize: String,
}, { timestamps: true });

// ==================== REVIEW SCHEMA ====================
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: String,
}, { timestamps: true });

// ==================== CONTACT SUBMISSION SCHEMA ====================
const contactSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  isResolved: { type: Boolean, default: false },
}, { timestamps: true });

// ==================== NEWSLETTER SUBSCRIBER SCHEMA ====================
const newsletterSubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// ==================== EXPORT MODELS ====================
// Using conditional model creation to avoid 'model overwrite error' during hot reloading
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export const CartItem = mongoose.models.CartItem || mongoose.model('CartItem', cartItemSchema);
export const WishlistItem = mongoose.models.WishlistItem || mongoose.model('WishlistItem', wishlistItemSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const OrderItem = mongoose.models.OrderItem || mongoose.model('OrderItem', orderItemSchema);
export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export const ContactSubmission = mongoose.models.ContactSubmission || mongoose.model('ContactSubmission', contactSubmissionSchema);
export const NewsletterSubscriber = mongoose.models.NewsletterSubscriber || mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);

// ==================== EXPORT ZOD SCHEMAS ====================
// User Schema
export const insertUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  address: z.any().optional().nullable(),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
});

// Category Schema
export const insertCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  parentId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  type: z.string().optional().nullable(),
});

// Product Schema
export const insertProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  description: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  price: z.number().min(0, 'Price must be a positive number'),
  originalPrice: z.number().optional().nullable(),
  images: z.array(z.string()),
  features: z.array(z.string()).optional().default([]),
  category: z.string(),
  brand: z.string().optional().nullable(),
  ageGroup: z.string().optional().nullable(),
  stock: z.number().default(0),
  isActive: z.boolean().default(true),
});

// CartItem Schema
export const insertCartItemSchema = z.object({
  user: z.string(),
  product: z.string(),
  quantity: z.number().min(1).default(1),
  selectedColor: z.string().optional().nullable(),
  selectedSize: z.string().optional().nullable(),
});

// WishlistItem Schema
export const insertWishlistItemSchema = z.object({
  user: z.string(),
  product: z.string(),
});

// Order Schema
export const insertOrderSchema = z.object({
  user: z.string(),
  total: z.number().min(0),
  status: z.nativeEnum(OrderStatus).default(OrderStatus.PENDING),
  paymentMethod: z.string(),
  shippingAddress: z.any(),
});

// OrderItem Schema
export const insertOrderItemSchema = z.object({
  order: z.string(),
  product: z.string(),
  productName: z.string(),
  productImage: z.string(),
  quantity: z.number().min(1),
  price: z.number().min(0),
  selectedColor: z.string().optional().nullable(),
  selectedSize: z.string().optional().nullable(),
});

// Review Schema
export const insertReviewSchema = z.object({
  user: z.string(),
  product: z.string(),
  rating: z.number().min(1).max(5),
  review: z.string().optional().nullable(),
});

// ContactSubmission Schema
export const insertContactSubmissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(2, 'Subject must be at least 2 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  isResolved: z.boolean().default(false),
});

// NewsletterSubscriber Schema
export const insertNewsletterSubscriberSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  isActive: z.boolean().default(true),
});

// ==================== EXPORT TYPES ====================
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserDocument = mongoose.Document & {
  username: string;
  email: string;
  password: string;
  fullName?: string | null;
  mobile?: string | null;
  address?: any;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};
export type User = UserDocument;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type CategoryDocument = mongoose.Document & {
  name: string;
  slug: string;
  parentId?: mongoose.Types.ObjectId | null;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
  type?: string | null;
  createdAt: Date;
  updatedAt: Date;
};
export type Category = CategoryDocument;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ProductDocument = mongoose.Document & {
  name: string;
  slug: string;
  description?: string | null;
  longDescription?: string | null;
  price: number;
  originalPrice?: number | null;
  images: string[];
  features: string[];
  category: mongoose.Types.ObjectId;
  brand?: string | null;
  ageGroup?: string | null;
  stock: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
export type Product = ProductDocument;

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItemDocument = mongoose.Document & {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
  createdAt: Date;
  updatedAt: Date;
};
export type CartItem = CartItemDocument;

export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;
export type WishlistItemDocument = mongoose.Document & {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};
export type WishlistItem = WishlistItemDocument;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderDocument = mongoose.Document & {
  user: mongoose.Types.ObjectId;
  items: mongoose.Types.ObjectId[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  shippingAddress: any;
  createdAt: Date;
  updatedAt: Date;
};
export type Order = OrderDocument;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItemDocument = mongoose.Document & {
  order: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
  createdAt: Date;
  updatedAt: Date;
};
export type OrderItem = OrderItemDocument;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type ReviewDocument = mongoose.Document & {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  rating: number;
  review?: string | null;
  createdAt: Date;
  updatedAt: Date;
};
export type Review = ReviewDocument;

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmissionDocument = mongoose.Document & {
  name: string;
  email: string;
  subject: string;
  message: string;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
};
export type ContactSubmission = ContactSubmissionDocument;

export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriberDocument = mongoose.Document & {
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
export type NewsletterSubscriber = NewsletterSubscriberDocument;