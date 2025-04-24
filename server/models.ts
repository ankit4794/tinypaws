import mongoose, { Schema } from 'mongoose';
import { UserRole, OrderStatus, WidgetType, WidgetSize } from '@shared/schema';

// User Schema
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String },
  mobile: { type: String },
  address: { type: Schema.Types.Mixed },
  role: { 
    type: String, 
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  googleId: { type: String },
  facebookId: { type: String },
  picture: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Category Schema
const categorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'Category' },
  description: { type: String },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  type: { type: String, enum: ['shop_for', 'accessories', 'brands', 'age', 'none'] },
  forPet: { type: String, enum: ['dog', 'cat', 'small_animal', 'all'] },
  displayOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Brand Schema
const brandSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  logo: { type: String, required: true },
  bannerImage: { type: String },
  featured: { type: Boolean, default: false },
  discount: {
    type: { type: String, enum: ['flat', 'percentage', 'none'], default: 'none' },
    value: { type: Number, default: 0 },
    label: { type: String }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Product Schema
const productSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  longDescription: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  images: [{ type: String }],
  features: [{ type: String }],
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: Schema.Types.ObjectId, ref: 'Brand' },
  ageGroup: { type: String },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// CartItem Schema
const cartItemSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
  selectedColor: { type: String },
  selectedSize: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// WishlistItem Schema
const wishlistItemSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Order Schema
const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ type: Schema.Types.ObjectId, ref: 'OrderItem' }],
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING
  },
  paymentMethod: { type: String, required: true },
  shippingAddress: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// OrderItem Schema
const orderItemSchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productImage: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  selectedColor: { type: String },
  selectedSize: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Review Schema
const reviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String },
  title: { type: String },
  images: [{ type: String }],
  isVerifiedPurchase: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  isHelpful: { type: Number, default: 0 },
  isNotHelpful: { type: Number, default: 0 },
  adminReply: {
    text: { type: String },
    date: { type: Date },
    adminUser: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  status: { type: String, default: 'published' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// HelpDesk Ticket Schema
const helpDeskTicketSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  orderRef: { type: Schema.Types.ObjectId, ref: 'Order' },
  productRef: { type: Schema.Types.ObjectId, ref: 'Product' },
  responses: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isStaff: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ContactSubmission Schema
const contactSubmissionSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  isResolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// NewsletterSubscriber Schema
const newsletterSubscriberSchema = new Schema({
  email: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// CmsPage Schema
const cmsPageSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  metaTitle: { type: String },
  metaDescription: { type: String },
  isActive: { type: Boolean, default: true },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ServiceablePincode Schema
const serviceablePincodeSchema = new Schema({
  pincode: { type: String, required: true, unique: true },
  city: { type: String },
  state: { type: String },
  deliveryDays: { type: Number, default: 3 },
  isActive: { type: Boolean, default: true },
  codAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Disclaimer Schema
const disclaimerSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Promotion Schema
const promotionSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  value: { type: Number, required: true },
  isPercentage: { type: Boolean, default: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  usageLimit: { type: Number },
  perUserLimit: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create models
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export const CartItem = mongoose.models.CartItem || mongoose.model('CartItem', cartItemSchema);
export const WishlistItem = mongoose.models.WishlistItem || mongoose.model('WishlistItem', wishlistItemSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const OrderItem = mongoose.models.OrderItem || mongoose.model('OrderItem', orderItemSchema);
export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export const HelpDeskTicket = mongoose.models.HelpDeskTicket || mongoose.model('HelpDeskTicket', helpDeskTicketSchema);
export const ContactSubmission = mongoose.models.ContactSubmission || mongoose.model('ContactSubmission', contactSubmissionSchema);
export const NewsletterSubscriber = mongoose.models.NewsletterSubscriber || mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
export const CmsPage = mongoose.models.CmsPage || mongoose.model('CmsPage', cmsPageSchema);
export const ServiceablePincode = mongoose.models.ServiceablePincode || mongoose.model('ServiceablePincode', serviceablePincodeSchema);
export const Disclaimer = mongoose.models.Disclaimer || mongoose.model('Disclaimer', disclaimerSchema);
export const Promotion = mongoose.models.Promotion || mongoose.model('Promotion', promotionSchema);

// Widget Position Schema (embedded document)
const widgetPositionSchema = new Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  w: { type: Number, required: true },
  h: { type: Number, required: true }
});

// Widget Schema (embedded document)
const widgetSchema = new Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: Object.values(WidgetType),
    required: true 
  },
  title: { type: String, required: true },
  size: { 
    type: String,
    enum: Object.values(WidgetSize),
    default: WidgetSize.MEDIUM
  },
  position: { type: widgetPositionSchema, required: true },
  settings: { type: Schema.Types.Mixed },
  isVisible: { type: Boolean, default: true }
});

// DashboardConfig Schema
const dashboardConfigSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  widgets: [widgetSchema],
  lastModified: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const DashboardConfig = mongoose.models.DashboardConfig || mongoose.model('DashboardConfig', dashboardConfigSchema);