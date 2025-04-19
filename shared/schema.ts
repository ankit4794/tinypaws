import mongoose from 'mongoose';
import { z } from 'zod';

// Define user roles enum
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
  MANAGER = 'MANAGER',
  EDITOR = 'EDITOR'
}

// Define order status enum
export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

// Define help desk ticket status enum
export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

// Define help desk ticket priority enum
export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Define promotion type enum
export enum PromotionType {
  DISCOUNT = 'DISCOUNT',
  BOGO = 'BOGO', // Buy one get one
  FREE_SHIPPING = 'FREE_SHIPPING',
  BUNDLE = 'BUNDLE',
  COUPON = 'COUPON'
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
  title: String,
  images: [String],
  isVerifiedPurchase: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  isHelpful: { type: Number, default: 0 },
  isNotHelpful: { type: Number, default: 0 },
  adminReply: {
    text: String,
    date: Date,
    adminUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
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

// ==================== HELP DESK TICKET SCHEMA ====================
const helpDeskTicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: Object.values(TicketStatus), default: TicketStatus.OPEN },
  priority: { type: String, enum: Object.values(TicketPriority), default: TicketPriority.MEDIUM },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TicketResponse' }],
  orderRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  productRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
}, { timestamps: true });

// ==================== TICKET RESPONSE SCHEMA ====================
const ticketResponseSchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'HelpDeskTicket', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  isStaff: { type: Boolean, default: false },
}, { timestamps: true });

// ==================== CMS PAGE SCHEMA ====================
const cmsPageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  metaTitle: String,
  metaDescription: String,
  isActive: { type: Boolean, default: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ==================== SERVICEABLE PINCODE SCHEMA ====================
const serviceablePincodeSchema = new mongoose.Schema({
  pincode: { type: String, required: true, unique: true },
  city: String,
  state: String,
  deliveryDays: { type: Number, default: 3 },
  isActive: { type: Boolean, default: true },
  codAvailable: { type: Boolean, default: true },
}, { timestamps: true });

// ==================== ABANDONED CART SCHEMA ====================
// We'll use the existing CartItem schema but track abandonment status

// ==================== DISCLAIMER SCHEMA ====================
const disclaimerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, required: true }, // e.g., 'product', 'shipping', 'payment'
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// ==================== PROMOTION SCHEMA ====================
const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: Object.values(PromotionType), required: true },
  value: { type: Number, required: true }, // Percentage or fixed amount
  isPercentage: { type: Boolean, default: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: Number,
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  usageLimit: Number, // How many times can be used in total
  perUserLimit: { type: Number, default: 1 }, // Times per user
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// ==================== USER ACTIVITY LOG SCHEMA ====================
const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., 'login', 'logout', 'create', 'update', 'delete'
  resourceType: String, // e.g., 'product', 'order', 'user'
  resourceId: mongoose.Schema.Types.ObjectId,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
}, { timestamps: true });

// ==================== ROLE PERMISSION SCHEMA ====================
const rolePermissionSchema = new mongoose.Schema({
  role: { type: String, enum: Object.values(UserRole), required: true },
  permissions: [{
    resource: { type: String, required: true }, // e.g., 'products', 'orders', 'users'
    actions: [{ type: String, required: true }], // e.g., 'create', 'read', 'update', 'delete'
  }],
}, { timestamps: true });

// ==================== USER SESSION SCHEMA ====================
const userSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  ipAddress: String,
  userAgent: String,
  expiresAt: { type: Date, required: true },
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
export const HelpDeskTicket = mongoose.models.HelpDeskTicket || mongoose.model('HelpDeskTicket', helpDeskTicketSchema);
export const TicketResponse = mongoose.models.TicketResponse || mongoose.model('TicketResponse', ticketResponseSchema);
export const CmsPage = mongoose.models.CmsPage || mongoose.model('CmsPage', cmsPageSchema);
export const ServiceablePincode = mongoose.models.ServiceablePincode || mongoose.model('ServiceablePincode', serviceablePincodeSchema);
export const Disclaimer = mongoose.models.Disclaimer || mongoose.model('Disclaimer', disclaimerSchema);
export const Promotion = mongoose.models.Promotion || mongoose.model('Promotion', promotionSchema);
export const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
export const RolePermission = mongoose.models.RolePermission || mongoose.model('RolePermission', rolePermissionSchema);
export const UserSession = mongoose.models.UserSession || mongoose.model('UserSession', userSessionSchema);

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
  title: z.string().optional().nullable(),
  review: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([]),
  isVerifiedPurchase: z.boolean().default(false),
  isApproved: z.boolean().default(false),
  isHelpful: z.number().default(0),
  isNotHelpful: z.number().default(0),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
});

// Admin Reply Schema
export const insertAdminReplySchema = z.object({
  text: z.string(),
  adminUser: z.string(),
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

// HelpDeskTicket Schema
export const insertHelpDeskTicketSchema = z.object({
  user: z.string(),
  subject: z.string().min(2, 'Subject must be at least 2 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  status: z.nativeEnum(TicketStatus).default(TicketStatus.OPEN),
  priority: z.nativeEnum(TicketPriority).default(TicketPriority.MEDIUM),
  assignedTo: z.string().optional().nullable(),
  orderRef: z.string().optional().nullable(),
  productRef: z.string().optional().nullable(),
});

// TicketResponse Schema
export const insertTicketResponseSchema = z.object({
  ticket: z.string(),
  user: z.string(),
  message: z.string().min(1, 'Response cannot be empty'),
  isStaff: z.boolean().default(false),
});

// CmsPage Schema
export const insertCmsPageSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  author: z.string().optional().nullable(),
});

// ServiceablePincode Schema
export const insertServiceablePincodeSchema = z.object({
  pincode: z.string().min(5, 'Pincode must be at least 5 characters'),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  deliveryDays: z.number().min(1).default(3),
  isActive: z.boolean().default(true),
  codAvailable: z.boolean().default(true),
});

// Disclaimer Schema
export const insertDisclaimerSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  type: z.string().min(2, 'Type must be at least 2 characters'),
  isActive: z.boolean().default(true),
});

// Promotion Schema
export const insertPromotionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(3, 'Code must be at least 3 characters'),
  type: z.nativeEnum(PromotionType),
  value: z.number().min(0, 'Value must be a positive number'),
  isPercentage: z.boolean().default(true),
  minOrderValue: z.number().min(0).default(0),
  maxDiscount: z.number().optional().nullable(),
  applicableProducts: z.array(z.string()).optional().default([]),
  applicableCategories: z.array(z.string()).optional().default([]),
  startDate: z.date(),
  endDate: z.date(),
  usageLimit: z.number().optional().nullable(),
  perUserLimit: z.number().default(1),
  isActive: z.boolean().default(true),
});

// ActivityLog Schema
export const insertActivityLogSchema = z.object({
  user: z.string(),
  action: z.string(),
  resourceType: z.string().optional().nullable(),
  resourceId: z.string().optional().nullable(),
  details: z.any().optional(),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
});

// RolePermission Schema
export const insertRolePermissionSchema = z.object({
  role: z.nativeEnum(UserRole),
  permissions: z.array(z.object({
    resource: z.string(),
    actions: z.array(z.string()),
  })),
});

// UserSession Schema
export const insertUserSessionSchema = z.object({
  user: z.string(),
  token: z.string(),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  expiresAt: z.date(),
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
export type InsertAdminReply = z.infer<typeof insertAdminReplySchema>;
export type ReviewDocument = mongoose.Document & {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  rating: number;
  title?: string | null;
  review?: string | null;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  isHelpful: number;
  isNotHelpful: number;
  adminReply?: {
    text: string;
    date: Date;
    adminUser: mongoose.Types.ObjectId;
  } | null;
  status: string;
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

export type InsertHelpDeskTicket = z.infer<typeof insertHelpDeskTicketSchema>;
export type HelpDeskTicketDocument = mongoose.Document & {
  user: mongoose.Types.ObjectId;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo?: mongoose.Types.ObjectId | null;
  responses: mongoose.Types.ObjectId[];
  orderRef?: mongoose.Types.ObjectId | null;
  productRef?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
};
export type HelpDeskTicket = HelpDeskTicketDocument;

export type InsertTicketResponse = z.infer<typeof insertTicketResponseSchema>;
export type TicketResponseDocument = mongoose.Document & {
  ticket: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  message: string;
  isStaff: boolean;
  createdAt: Date;
  updatedAt: Date;
};
export type TicketResponse = TicketResponseDocument;

export type InsertCmsPage = z.infer<typeof insertCmsPageSchema>;
export type CmsPageDocument = mongoose.Document & {
  title: string;
  slug: string;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  isActive: boolean;
  author?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
};
export type CmsPage = CmsPageDocument;

export type InsertServiceablePincode = z.infer<typeof insertServiceablePincodeSchema>;
export type ServiceablePincodeDocument = mongoose.Document & {
  pincode: string;
  city?: string | null;
  state?: string | null;
  deliveryDays: number;
  isActive: boolean;
  codAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
};
export type ServiceablePincode = ServiceablePincodeDocument;

export type InsertDisclaimer = z.infer<typeof insertDisclaimerSchema>;
export type DisclaimerDocument = mongoose.Document & {
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
export type Disclaimer = DisclaimerDocument;

export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type PromotionDocument = mongoose.Document & {
  name: string;
  code: string;
  type: PromotionType;
  value: number;
  isPercentage: boolean;
  minOrderValue: number;
  maxDiscount?: number | null;
  applicableProducts: mongoose.Types.ObjectId[];
  applicableCategories: mongoose.Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  usageLimit?: number | null;
  perUserLimit: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
export type Promotion = PromotionDocument;

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLogDocument = mongoose.Document & {
  user: mongoose.Types.ObjectId;
  action: string;
  resourceType?: string | null;
  resourceId?: mongoose.Types.ObjectId | null;
  details?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
};
export type ActivityLog = ActivityLogDocument;

export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type RolePermissionDocument = mongoose.Document & {
  role: UserRole;
  permissions: {
    resource: string;
    actions: string[];
  }[];
  createdAt: Date;
  updatedAt: Date;
};
export type RolePermission = RolePermissionDocument;

export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSessionDocument = mongoose.Document & {
  user: mongoose.Types.ObjectId;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
export type UserSession = UserSessionDocument;