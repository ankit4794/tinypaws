import { IStorage } from './storage';
import mongoose from 'mongoose';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import { 
  UserRole,
  OrderStatus,
  WidgetType,
  WidgetSize,
  InsertDashboardConfig
} from '@shared/schema';
import {
  User,
  Category,
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
} from './models';

// Types for MongoDB documents
export type UserDocument = mongoose.Document & {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  mobile?: string;
  address?: any;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductDocument = mongoose.Document & {
  name: string;
  slug: string;
  description?: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  features: string[];
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

export type CategoryDocument = mongoose.Document & {
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

export type CartItemDocument = mongoose.Document & {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WishlistItemDocument = mongoose.Document & {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderDocument = mongoose.Document & {
  user: mongoose.Types.ObjectId;
  items: mongoose.Types.ObjectId[];
  total: number;
  status: string;
  paymentMethod: string;
  shippingAddress: any;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItemDocument = mongoose.Document & {
  order: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  selectedColor?: string;
  selectedSize?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ReviewDocument = mongoose.Document & {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  rating: number;
  review?: string;
  title?: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  isHelpful: number;
  isNotHelpful: number;
  adminReply?: {
    text: string;
    date: Date;
    adminUser: mongoose.Types.ObjectId;
  };
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ContactSubmissionDocument = mongoose.Document & {
  name: string;
  email: string;
  subject: string;
  message: string;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type NewsletterSubscriberDocument = mongoose.Document & {
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CmsPageDocument = mongoose.Document & {
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  author?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type ServiceablePincodeDocument = mongoose.Document & {
  pincode: string;
  city?: string;
  state?: string;
  deliveryDays: number;
  isActive: boolean;
  codAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type DisclaimerDocument = mongoose.Document & {
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PromotionDocument = mongoose.Document & {
  name: string;
  code: string;
  type: string;
  value: number;
  isPercentage: boolean;
  minOrderValue: number;
  maxDiscount?: number;
  applicableProducts?: mongoose.Types.ObjectId[];
  applicableCategories?: mongoose.Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  perUserLimit: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Product filter options interface
interface ProductFilterOptions {
  category?: string;
  subcategory?: string;
  sort?: string;
  limit?: number;
}

export class MongoDBStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Create the session store directly with TLS options
    this.sessionStore = connectMongo.create({
      mongoUrl: process.env.MONGODB_URL || '',
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60, // 14 days
      clientOptions: {
        tls: true,
        tlsAllowInvalidCertificates: true
      }
    });
  }

  // User-related methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const user = await User.findById(id).lean();
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await User.findOne({ username }).lean();
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await User.findOne({ email }).lean();
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return undefined;
    }
  }

  async getUserByMobile(mobile: string): Promise<User | undefined> {
    try {
      const user = await User.findOne({ mobile }).lean();
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user by mobile:', error);
      return undefined;
    }
  }

  async createUser(userData: any): Promise<User> {
    try {
      const user = new User(userData);
      await user.save();
      return user.toObject();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<any>): Promise<User | undefined> {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { $set: userData },
        { new: true }
      ).lean();
      
      return user || undefined;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  // Product-related methods
  async getProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
    try {
      const { category, subcategory, sort, limit } = options;
      
      // Build query conditions
      const query: any = { isActive: true };
      
      // Add category filter if provided
      if (category) {
        const categoryDoc = await Category.findOne({ slug: category }).lean();
        if (categoryDoc) {
          query.category = categoryDoc._id;
        }
      }
      
      // Add subcategory filter if provided
      if (subcategory) {
        const subcategoryDoc = await Category.findOne({ 
          slug: subcategory,
          parentId: { $exists: true } 
        }).lean();
        
        if (subcategoryDoc) {
          query.subcategory = subcategoryDoc._id;
        }
      }
      
      // Create the base query
      let productsQuery = Product.find(query);
      
      // Add sorting
      if (sort === 'price-low-high') {
        productsQuery = productsQuery.sort({ price: 1 });
      } else if (sort === 'price-high-low') {
        productsQuery = productsQuery.sort({ price: -1 });
      } else if (sort === 'name-a-z') {
        productsQuery = productsQuery.sort({ name: 1 });
      } else if (sort === 'name-z-a') {
        productsQuery = productsQuery.sort({ name: -1 });
      } else if (sort === 'newest') {
        productsQuery = productsQuery.sort({ createdAt: -1 });
      } else if (sort === 'rating') {
        productsQuery = productsQuery.sort({ rating: -1 });
      } else {
        // Default sorting
        productsQuery = productsQuery.sort({ createdAt: -1 });
      }
      
      // Add limit if provided
      if (limit) {
        productsQuery = productsQuery.limit(limit);
      }
      
      // Execute query with populate
      const products = await productsQuery
        .populate('category')
        .lean();
      
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | undefined> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return undefined;
      }
      
      const product = await Product.findById(id)
        .populate('category')
        .populate({
          path: 'reviews',
          populate: {
            path: 'user',
            select: 'username fullName'
          }
        })
        .lean();
      
      return product || undefined;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return undefined;
    }
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    try {
      const product = await Product.findOne({ slug })
        .populate('category')
        .populate({
          path: 'reviews',
          populate: {
            path: 'user',
            select: 'username fullName'
          }
        })
        .lean();
      
      return product || undefined;
    } catch (error) {
      console.error('Error fetching product by slug:', error);
      return undefined;
    }
  }

  async getSimilarProducts(productId: string, limit: number = 4): Promise<Product[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return [];
      }
      
      // Get the product to find its category
      const product = await Product.findById(productId).select('category').lean();
      
      if (!product) return [];
      
      // Find similar products (same category, different product)
      const similarProducts = await Product.find({
        category: product.category,
        _id: { $ne: productId },
        isActive: true
      })
      .sort({ rating: -1 })
      .limit(limit)
      .lean();
      
      return similarProducts;
    } catch (error) {
      console.error('Error fetching similar products:', error);
      return [];
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      // Create text search query
      const searchQuery = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } }
        ],
        isActive: true
      };
      
      const products = await Product.find(searchQuery)
        .sort({ rating: -1 })
        .limit(20)
        .lean();
      
      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // Category-related methods
  async getCategories(): Promise<Category[]> {
    try {
      // Find all main categories (no parentId)
      const categories = await Category.find({
        isActive: true,
        parentId: { $exists: false }
      })
      .sort({ name: 1 })
      .lean();
      
      // For each category, find its subcategories
      const categoriesWithSubs = await Promise.all(
        categories.map(async (category) => {
          const subCategories = await Category.find({
            parentId: category._id,
            isActive: true
          })
          .sort({ name: 1 })
          .lean();
          
          return {
            ...category,
            subCategories
          };
        })
      );
      
      return categoriesWithSubs;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    try {
      const category = await Category.findOne({ slug })
        .lean();
      
      if (!category) return undefined;
      
      // Get subcategories
      const subCategories = await Category.find({
        parentId: category._id,
        isActive: true
      })
      .sort({ name: 1 })
      .lean();
      
      // Get parent if it exists
      let parent = null;
      if (category.parentId) {
        parent = await Category.findById(category.parentId).lean();
      }
      
      return {
        ...category,
        subCategories,
        parent
      };
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      return undefined;
    }
  }

  async getSubcategories(categoryId: string): Promise<Category[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return [];
      }
      
      const subcategories = await Category.find({
        parentId: categoryId,
        isActive: true
      })
      .sort({ name: 1 })
      .lean();
      
      return subcategories;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      return [];
    }
  }

  // Cart-related methods
  async getCartItems(userId: string): Promise<CartItem[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return [];
      }
      
      const cartItems = await CartItem.find({ user: userId })
        .populate('product')
        .sort({ createdAt: -1 })
        .lean();
      
      return cartItems;
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return [];
    }
  }

  async addToCart(
    userId: string, 
    productId: string, 
    quantity: number = 1, 
    options?: { color?: string, size?: string }
  ): Promise<CartItem> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid user ID or product ID');
      }
      
      // Check if item already exists in cart
      const existingItem = await CartItem.findOne({
        user: userId,
        product: productId,
        selectedColor: options?.color,
        selectedSize: options?.size
      });
      
      if (existingItem) {
        // Update quantity if item exists
        existingItem.quantity += quantity;
        existingItem.updatedAt = new Date();
        await existingItem.save();
        
        const populatedItem = await CartItem.findById(existingItem._id)
          .populate('product')
          .lean();
          
        return populatedItem!;
      } else {
        // Create new cart item
        const newCartItem = new CartItem({
          user: userId,
          product: productId,
          quantity,
          selectedColor: options?.color,
          selectedSize: options?.size
        });
        
        await newCartItem.save();
        
        const populatedItem = await CartItem.findById(newCartItem._id)
          .populate('product')
          .lean();
          
        return populatedItem!;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItemQuantity(userId: string, itemId: string, quantity: number): Promise<CartItem | undefined> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(itemId)) {
        return undefined;
      }
      
      // Verify the cart item belongs to the user
      const cartItem = await CartItem.findOne({
        _id: itemId,
        user: userId
      });
      
      if (!cartItem) return undefined;
      
      // Update quantity
      cartItem.quantity = quantity;
      cartItem.updatedAt = new Date();
      
      await cartItem.save();
      
      const updatedItem = await CartItem.findById(itemId)
        .populate('product')
        .lean();
        
      return updatedItem || undefined;
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      return undefined;
    }
  }

  async removeFromCart(userId: string, itemId: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(itemId)) {
        return;
      }
      
      // Verify the cart item belongs to the user
      const cartItem = await CartItem.findOne({
        _id: itemId,
        user: userId
      });
      
      if (!cartItem) return;
      
      // Delete the cart item
      await CartItem.deleteOne({ _id: itemId });
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }

  async clearCart(userId: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return;
      }
      
      // Delete all cart items for this user
      await CartItem.deleteMany({ user: userId });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }

  // Wishlist-related methods
  async getWishlistItems(userId: string): Promise<WishlistItem[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return [];
      }
      
      const wishlistItems = await WishlistItem.find({ user: userId })
        .populate('product')
        .sort({ createdAt: -1 })
        .lean();
      
      return wishlistItems;
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      return [];
    }
  }

  async addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid user ID or product ID');
      }
      
      // Check if product already in wishlist
      const existingItem = await WishlistItem.findOne({
        user: userId,
        product: productId
      });
      
      if (existingItem) {
        // Return existing wishlist item with populated product
        const populatedItem = await WishlistItem.findById(existingItem._id)
          .populate('product')
          .lean();
          
        return populatedItem!;
      }
      
      // Create new wishlist item
      const newWishlistItem = new WishlistItem({
        user: userId,
        product: productId
      });
      
      await newWishlistItem.save();
      
      // Return the new wishlist item with populated product
      const populatedItem = await WishlistItem.findById(newWishlistItem._id)
        .populate('product')
        .lean();
        
      return populatedItem!;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
        return;
      }
      
      // Delete the wishlist item
      await WishlistItem.deleteOne({
        user: userId,
        product: productId
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  }

  // Order-related methods
  async createOrder(
    userId: string, 
    items: any[], 
    shippingAddress: any, 
    paymentMethod: string
  ): Promise<Order> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }
      
      // Calculate total
      let total = 0;
      for (const item of items) {
        total += item.price * item.quantity;
      }
      
      // Create order first
      const newOrder = new Order({
        user: userId,
        total,
        shippingAddress,
        paymentMethod,
        status: OrderStatus.PENDING // This is defined as 'PENDING' in the schema
      });
      
      await newOrder.save();
      
      // Create order items
      const orderItems = [];
      for (const item of items) {
        const orderItem = new OrderItem({
          order: newOrder._id,
          product: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          quantity: item.quantity,
          price: item.price,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize
        });
        
        await orderItem.save();
        orderItems.push(orderItem);
      }
      
      // Link order items to order
      newOrder.items = orderItems.map(item => item._id);
      await newOrder.save();
      
      // Clear cart after order
      await this.clearCart(userId);
      
      // Return full order with items
      const populatedOrder = await Order.findById(newOrder._id)
        .populate('items')
        .lean();
      
      return populatedOrder!;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return [];
      }
      
      const orders = await Order.find({ user: userId })
        .populate({
          path: 'items',
          populate: {
            path: 'product'
          }
        })
        .sort({ createdAt: -1 })
        .lean();
      
      return orders;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  async getOrderDetails(userId: string, orderId: string): Promise<(Order & { items: OrderItem[] }) | undefined> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(orderId)) {
        return undefined;
      }
      
      const order = await Order.findOne({
        _id: orderId,
        user: userId
      })
      .populate({
        path: 'items',
        populate: {
          path: 'product'
        }
      })
      .lean();
      
      return order as (Order & { items: OrderItem[] });
    } catch (error) {
      console.error('Error fetching order details:', error);
      return undefined;
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | undefined> {
    try {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return undefined;
      }
      
      // Validate status is a valid OrderStatus (case matters - schema uses uppercase)
      const validStatuses = Object.values(OrderStatus);
      if (!validStatuses.includes(status as OrderStatus)) {
        // Try to convert to uppercase if needed
        const uppercaseStatus = status.toUpperCase();
        if (!validStatuses.includes(uppercaseStatus as OrderStatus)) {
          throw new Error(`Invalid order status: ${status}. Valid values are: ${validStatuses.join(', ')}`);
        }
        // If we reach here, use the uppercase version
        status = uppercaseStatus;
      }
      
      const order = await Order.findByIdAndUpdate(
        orderId,
        { 
          $set: { 
            status,
            updatedAt: new Date()
          } 
        },
        { new: true }
      ).lean();
      
      return order || undefined;
    } catch (error) {
      console.error('Error updating order status:', error);
      return undefined;
    }
  }

  // Review-related methods
  async getProductReviews(productId: string): Promise<Review[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return [];
      }
      
      const reviews = await Review.find({ product: productId })
        .populate({
          path: 'user',
          select: 'username fullName'
        })
        .sort({ createdAt: -1 })
        .lean();
      
      return reviews;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return [];
    }
  }

  async addReview(userId: string, productId: string, rating: number, reviewText: string): Promise<Review> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid user ID or product ID');
      }
      
      // Create the review
      const newReview = new Review({
        user: userId,
        product: productId,
        rating,
        review: reviewText,
        isVerifiedPurchase: false, // This could be updated based on purchase history
        isApproved: false,
        status: 'pending'
      });
      
      await newReview.save();
      
      // Get populated review to return
      const populatedReview = await Review.findById(newReview._id)
        .populate({
          path: 'user',
          select: 'username fullName'
        })
        .lean();
      
      // Update product rating
      const productReviews = await Review.find({ product: productId });
      
      const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / productReviews.length;
      
      await Product.findByIdAndUpdate(
        productId,
        { 
          $set: { 
            rating: averageRating,
            reviewCount: productReviews.length
          } 
        }
      );
      
      return populatedReview!;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  // Contact-related methods
  async submitContactForm(submission: InsertContactSubmission): Promise<ContactSubmission> {
    try {
      const newSubmission = new ContactSubmission({
        name: submission.name,
        email: submission.email,
        subject: submission.subject,
        message: submission.message,
        isResolved: false
      });
      
      await newSubmission.save();
      return newSubmission;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }
  }

  // Newsletter-related methods
  async subscribeToNewsletter(email: string): Promise<NewsletterSubscriber> {
    try {
      // Check if already subscribed
      const existingSubscriber = await NewsletterSubscriber.findOne({ email });
      
      if (existingSubscriber) {
        if (!existingSubscriber.isActive) {
          // Reactivate subscription
          existingSubscriber.isActive = true;
          await existingSubscriber.save();
          return existingSubscriber;
        }
        return existingSubscriber;
      }
      
      // Create new subscription
      const newSubscriber = new NewsletterSubscriber({
        email,
        isActive: true
      });
      
      await newSubscriber.save();
      return newSubscriber;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  }

  // Admin-specific methods (for the admin panel)
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await User.find()
        .sort({ createdAt: -1 })
        .lean();
      
      return users;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  async createProduct(productData: any): Promise<Product> {
    try {
      const newProduct = new Product(productData);
      await newProduct.save();
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, productData: any): Promise<Product | undefined> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return undefined;
      }
      
      const product = await Product.findByIdAndUpdate(
        id,
        { $set: productData },
        { new: true }
      ).lean();
      
      return product || undefined;
    } catch (error) {
      console.error('Error updating product:', error);
      return undefined;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid product ID');
      }
      
      await Product.findByIdAndDelete(id);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async createCategory(categoryData: any): Promise<Category> {
    try {
      const newCategory = new Category(categoryData);
      await newCategory.save();
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(id: string, categoryData: any): Promise<Category | undefined> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return undefined;
      }
      
      const category = await Category.findByIdAndUpdate(
        id,
        { $set: categoryData },
        { new: true }
      ).lean();
      
      return category || undefined;
    } catch (error) {
      console.error('Error updating category:', error);
      return undefined;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid category ID');
      }
      
      await Category.findByIdAndDelete(id);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const orders = await Order.find()
        .populate({
          path: 'user',
          select: 'username fullName email'
        })
        .populate('items')
        .sort({ createdAt: -1 })
        .lean();
      
      return orders;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  }

  async getContactSubmissions(resolved?: boolean): Promise<ContactSubmission[]> {
    try {
      let query = {};
      if (resolved !== undefined) {
        query = { isResolved: resolved };
      }
      
      const submissions = await ContactSubmission.find(query)
        .sort({ createdAt: -1 })
        .lean();
      
      return submissions;
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      return [];
    }
  }

  async updateContactSubmissionStatus(id: string, isResolved: boolean): Promise<ContactSubmission | undefined> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return undefined;
      }
      
      const submission = await ContactSubmission.findByIdAndUpdate(
        id,
        { $set: { isResolved } },
        { new: true }
      ).lean();
      
      return submission || undefined;
    } catch (error) {
      console.error('Error updating contact submission status:', error);
      return undefined;
    }
  }

  // Dashboard configuration methods
  async getDashboardConfig(userId: string): Promise<DashboardConfig | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return null;
      }
      
      const dashboardConfig = await DashboardConfig.findOne({ userId }).lean();
      return dashboardConfig;
    } catch (error) {
      console.error('Error fetching dashboard config:', error);
      return null;
    }
  }

  async createDashboardConfig(config: InsertDashboardConfig): Promise<DashboardConfig> {
    try {
      const dashboardConfig = new DashboardConfig({
        ...config,
        lastModified: new Date()
      });
      await dashboardConfig.save();
      return dashboardConfig.toObject();
    } catch (error) {
      console.error('Error creating dashboard config:', error);
      throw error;
    }
  }

  async updateDashboardConfig(userId: string, config: Partial<DashboardConfig>): Promise<DashboardConfig | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return null;
      }
      
      const dashboardConfig = await DashboardConfig.findOneAndUpdate(
        { userId },
        { 
          $set: {
            ...config,
            lastModified: new Date()
          } 
        },
        { new: true, upsert: true }
      ).lean();
      
      return dashboardConfig;
    } catch (error) {
      console.error('Error updating dashboard config:', error);
      return null;
    }
  }

  async updateWidgetPositions(userId: string, widgets: { id: string, position: { x: number, y: number, w: number, h: number } }[]): Promise<DashboardConfig | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return null;
      }
      
      // Get the dashboard config
      const dashboardConfig = await DashboardConfig.findOne({ userId });
      
      if (!dashboardConfig) {
        return null;
      }
      
      // Update each widget position
      for (const updateData of widgets) {
        const widgetIndex = dashboardConfig.widgets.findIndex(w => w.id === updateData.id);
        
        if (widgetIndex !== -1) {
          dashboardConfig.widgets[widgetIndex].position = updateData.position;
        }
      }
      
      // Save the updated config
      dashboardConfig.lastModified = new Date();
      await dashboardConfig.save();
      
      return dashboardConfig.toObject();
    } catch (error) {
      console.error('Error updating widget positions:', error);
      return null;
    }
  }

  async toggleWidgetVisibility(userId: string, widgetId: string, isVisible: boolean): Promise<DashboardConfig | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return null;
      }
      
      // Get the dashboard config
      const dashboardConfig = await DashboardConfig.findOne({ userId });
      
      if (!dashboardConfig) {
        return null;
      }
      
      // Find the widget
      const widgetIndex = dashboardConfig.widgets.findIndex(w => w.id === widgetId);
      
      if (widgetIndex !== -1) {
        // Update visibility
        dashboardConfig.widgets[widgetIndex].isVisible = isVisible;
        
        // Save the updated config
        dashboardConfig.lastModified = new Date();
        await dashboardConfig.save();
      }
      
      return dashboardConfig.toObject();
    } catch (error) {
      console.error('Error toggling widget visibility:', error);
      return null;
    }
  }
}