import mongoose from 'mongoose';
const { Schema } = mongoose;
import bcrypt from 'bcryptjs';

// User Schema
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String },
  mobile: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String }
  },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  googleId: { type: String },
  facebookId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Category Schema
const categorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  parent: { type: Schema.Types.ObjectId, ref: 'Category' },
  subcategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Brand Schema
const brandSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  logo: { type: String },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Product Schema
const productSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: Schema.Types.ObjectId, ref: 'Brand' },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  images: [{ type: String }],
  inventory: {
    inStock: { type: Boolean, default: true },
    quantity: { type: Number }
  },
  specifications: [
    {
      name: { type: String },
      value: { type: String }
    }
  ],
  variants: [
    {
      name: { type: String },
      price: { type: Number },
      salePrice: { type: Number },
      sku: { type: String }
    }
  ],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  features: [{ type: String }],
  tags: [{ type: String }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Cart Item Schema
const cartItemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  weight: { type: String },
  pack: { type: String },
  variant: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Wishlist Item Schema
const wishlistItemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Order Schema
const orderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  items: [{ type: Schema.Types.ObjectId, ref: 'OrderItem' }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cod', 'online'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'placed'
  },
  trackingNumber: { type: String },
  courier: { type: String },
  notes: { type: String },
  deliveryInstructions: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Order Item Schema
const orderItemSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  weight: { type: String },
  pack: { type: String },
  variant: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Review Schema
const reviewSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  comment: { type: String },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Contact Submission Schema
const contactSubmissionSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'read', 'responded'], default: 'new' },
  createdAt: { type: Date, default: Date.now }
});

// Newsletter Subscriber Schema
const newsletterSubscriberSchema = new Schema({
  email: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// CMS Page Schema
const cmsPageSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  metaTitle: { type: String },
  metaDescription: { type: String },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Serviceable Pincode Schema
const serviceablePincodeSchema = new Schema({
  pincode: { type: String, required: true, unique: true },
  areaName: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  deliveryCharge: { type: Number, required: true },
  deliveryTime: { type: String, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Disclaimer Schema
const disclaimerSchema = new Schema({
  name: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  brand: { type: Schema.Types.ObjectId, ref: 'Brand' },
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Promotion Schema
const promotionSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  position: { type: String, enum: ['banner', 'popup', 'carousel'], default: 'banner' },
  link: { type: String },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Dashboard Config Schema
const dashboardConfigSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  widgets: [
    {
      id: { type: String, required: true },
      type: { type: String, required: true },
      position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        w: { type: Number, required: true },
        h: { type: Number, required: true }
      },
      data: { type: Schema.Types.Mixed }
    }
  ],
  updatedAt: { type: Date, default: Date.now }
});

// Register models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const CartItem = mongoose.models.CartItem || mongoose.model('CartItem', cartItemSchema);
const WishlistItem = mongoose.models.WishlistItem || mongoose.model('WishlistItem', wishlistItemSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
const OrderItem = mongoose.models.OrderItem || mongoose.model('OrderItem', orderItemSchema);
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
const ContactSubmission = mongoose.models.ContactSubmission || mongoose.model('ContactSubmission', contactSubmissionSchema);
const NewsletterSubscriber = mongoose.models.NewsletterSubscriber || mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
const CmsPage = mongoose.models.CmsPage || mongoose.model('CmsPage', cmsPageSchema);
const ServiceablePincode = mongoose.models.ServiceablePincode || mongoose.model('ServiceablePincode', serviceablePincodeSchema);
const Disclaimer = mongoose.models.Disclaimer || mongoose.model('Disclaimer', disclaimerSchema);
const Promotion = mongoose.models.Promotion || mongoose.model('Promotion', promotionSchema);
const DashboardConfig = mongoose.models.DashboardConfig || mongoose.model('DashboardConfig', dashboardConfigSchema);

export {
  User,
  Category,
  Brand,
  Product,
  CartItem,
  WishlistItem,
  Order,
  OrderItem,
  Review,
  ContactSubmission,
  NewsletterSubscriber,
  CmsPage,
  ServiceablePincode,
  Disclaimer,
  Promotion,
  DashboardConfig
};