import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  description: String,
  image: String,
  isActive: { type: Boolean, default: true },
  type: { type: String, enum: ['shop_for', 'accessories', 'brands', 'age'] },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, required: true },
  originalPrice: Number,
  images: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: String,
  ageGroup: String,
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Category = mongoose.model('Category', categorySchema);
export const Product = mongoose.model('Product', productSchema);

// Users
//export const users = pgTable("users", { ... }); // Removed PostgreSQL schema
//export const insertUserSchema = createInsertSchema(users).pick({ ... }); // Removed

// Cart Items
//export const cartItems = pgTable("cart_items", { ... }); // Removed PostgreSQL schema
//export const insertCartItemSchema = createInsertSchema(cartItems).omit({ ... }); // Removed

// Wishlist Items
//export const wishlistItems = pgTable("wishlist_items", { ... }); // Removed PostgreSQL schema
//export const insertWishlistItemSchema = createInsertSchema(wishlistItems).omit({ ... }); // Removed

// Orders
//export const orders = pgTable("orders", { ... }); // Removed PostgreSQL schema
//export const insertOrderSchema = createInsertSchema(orders).omit({ ... }); // Removed

// Order Items
//export const orderItems = pgTable("order_items", { ... }); // Removed PostgreSQL schema
//export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ ... }); // Removed

// Reviews
//export const reviews = pgTable("reviews", { ... }); // Removed PostgreSQL schema
//export const insertReviewSchema = createInsertSchema(reviews).omit({ ... }); // Removed

// Contact Form Submissions
//export const contactSubmissions = pgTable("contact_submissions", { ... }); // Removed PostgreSQL schema
//export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({ ... }); // Removed

// Newsletter Subscribers
//export const newsletterSubscribers = pgTable("newsletter_subscribers", { ... }); // Removed PostgreSQL schema
//export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({ ... }); // Removed


// Type Exports - Adjusted for Mongoose
export type InsertUser = any; // Placeholder, needs definition based on user schema if using Mongoose
export type User = any; // Placeholder

export type InsertCategory = any;
export type Category = mongoose.Document & {
    name: string;
    slug: string;
    parentId?: mongoose.Types.ObjectId;
    description?: string;
    image?: string;
    isActive: boolean;
    type?: string;
    createdAt: Date;
    updatedAt: Date;
};

export type InsertProduct = any;
export type Product = mongoose.Document & {
    name: string;
    slug: string;
    description?: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category: mongoose.Types.ObjectId;
    brand?: string;
    ageGroup?: string;
    stock: number;
    rating: number;
    reviewCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type InsertCartItem = any; // Placeholder
export type CartItem = any; // Placeholder

export type InsertWishlistItem = any; // Placeholder
export type WishlistItem = any; // Placeholder

export type InsertOrder = any; // Placeholder
export type Order = any; // Placeholder

export type InsertOrderItem = any; // Placeholder
export type OrderItem = any; // Placeholder

export type InsertReview = any; // Placeholder
export type Review = any; // Placeholder

export type InsertContactSubmission = any; // Placeholder
export type ContactSubmission = any; // Placeholder

export type InsertNewsletterSubscriber = any; // Placeholder
export type NewsletterSubscriber = any; // Placeholder