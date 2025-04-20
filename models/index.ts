import mongoose, { Schema } from 'mongoose';

// User schema
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, unique: true },
  password: { type: String, required: true },
  fullName: { type: String },
  mobile: { type: String },
  address: { type: Schema.Types.Mixed },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  googleId: { type: String },
  facebookId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Category schema
const categorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'Category' },
  description: { type: String },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  type: { type: String },
}, { timestamps: true });

// Brand schema
const brandSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  logo: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Product schema
const productSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: Schema.Types.ObjectId, ref: 'Brand' },
  images: [{ type: String }],
  features: [{ type: String }],
  specifications: { type: Schema.Types.Mixed },
  variants: [{ 
    name: { type: String },
    price: { type: Number },
    salePrice: { type: Number },
    weight: { type: String },
    sku: { type: String },
    stock: { type: Number, default: 0 }
  }],
  inStock: { type: Boolean, default: true },
  stockQuantity: { type: Number, default: 1 },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  colors: [{ type: String }],
  sizes: [{ type: String }],
  weight: { type: String },
  dimensions: { type: String },
}, { timestamps: true });

// Cart item schema
const cartItemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String }, // For non-logged in users
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
  selectedColor: { type: String },
  selectedSize: { type: String },
  selectedVariant: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Wishlist item schema
const wishlistItemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  addedAt: { type: Date, default: Date.now },
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

// Order schema
const orderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String }, // For guest checkouts
  orderNumber: { type: String, required: true, unique: true },
  items: [{ 
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    selectedColor: { type: String },
    selectedSize: { type: String },
    selectedVariant: { type: Schema.Types.Mixed },
    image: { type: String }
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number },
  shipping: { type: Number },
  total: { type: Number, required: true },
  shippingAddress: {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    mobile: { type: String, required: true },
  },
  paymentMethod: { type: String, enum: ['cod', 'card', 'upi'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  notes: { type: String },
  deliveryPincode: { type: String },
  isGuestCheckout: { type: Boolean, default: false },
  transactionId: { type: String },
}, { timestamps: true });

// Order Item schema
const orderItemSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true },
  selectedColor: { type: String },
  selectedSize: { type: String },
  selectedVariant: { type: Schema.Types.Mixed },
  image: { type: String }
}, { timestamps: true });

// Review schema
const reviewSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  comment: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });

// Contact submission schema
const contactSubmissionSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'read', 'responded'], default: 'new' },
  responseMessage: { type: String },
  responseDate: { type: Date },
}, { timestamps: true });

// Newsletter subscriber schema
const newsletterSubscriberSchema = new Schema({
  email: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  source: { type: String },
}, { timestamps: true });

// CMS Page schema
const cmsPageSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  metaTitle: { type: String },
  metaDescription: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Serviceable Pincode schema
const serviceablePincodeSchema = new Schema({
  pincode: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  deliveryDays: { type: Number, default: 3 },
  codAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Disclaimer schema
const disclaimerSchema = new Schema({
  type: { type: String, required: true, unique: true }, // e.g., 'shipping', 'payment', 'return'
  content: { type: String, required: true },
}, { timestamps: true });

// Promotion schema
const promotionSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  usageLimit: { type: Number },
  usedCount: { type: Number, default: 0 },
  applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
}, { timestamps: true });

// Dashboard Config schema
const dashboardConfigSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  widgets: [{ 
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      w: { type: Number, required: true },
      h: { type: Number, required: true },
    },
    config: { type: Schema.Types.Mixed },
  }],
}, { timestamps: true });

// Export models
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export const CartItem = mongoose.models.CartItem || mongoose.model('CartItem', cartItemSchema);
export const WishlistItem = mongoose.models.WishlistItem || mongoose.model('WishlistItem', wishlistItemSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const OrderItem = mongoose.models.OrderItem || mongoose.model('OrderItem', orderItemSchema);
export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export const ContactSubmission = mongoose.models.ContactSubmission || mongoose.model('ContactSubmission', contactSubmissionSchema);
export const NewsletterSubscriber = mongoose.models.NewsletterSubscriber || mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
export const CmsPage = mongoose.models.CmsPage || mongoose.model('CmsPage', cmsPageSchema);
export const ServiceablePincode = mongoose.models.ServiceablePincode || mongoose.model('ServiceablePincode', serviceablePincodeSchema);
export const Disclaimer = mongoose.models.Disclaimer || mongoose.model('Disclaimer', disclaimerSchema);
export const Promotion = mongoose.models.Promotion || mongoose.model('Promotion', promotionSchema);
export const DashboardConfig = mongoose.models.DashboardConfig || mongoose.model('DashboardConfig', dashboardConfigSchema);