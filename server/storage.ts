import type { 
  User, InsertUser, 
  Product, InsertProduct, 
  Category, InsertCategory,
  CartItem, InsertCartItem,
  WishlistItem, InsertWishlistItem,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  Review, InsertReview,
  ContactSubmission, InsertContactSubmission,
  NewsletterSubscriber, InsertNewsletterSubscriber
} from "@shared/schema";
import session from "express-session";
import connectMongo from "connect-mongo";

// Product filter options interface
interface ProductFilterOptions {
  category?: string;
  subcategory?: string;
  sort?: string;
  limit?: number;
}

export interface IStorage {
  // User-related methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByMobile(mobile: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  updateUser(id: string, userData: Partial<any>): Promise<User | undefined>;
  
  // Product-related methods
  getProducts(options?: ProductFilterOptions): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getSimilarProducts(productId: string, limit?: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Category-related methods
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getSubcategories(categoryId: string): Promise<Category[]>;
  
  // Cart-related methods
  getCartItems(userId: string): Promise<CartItem[]>;
  addToCart(userId: string, productId: string, quantity?: number, options?: { color?: string, size?: string }): Promise<CartItem>;
  updateCartItemQuantity(userId: string, itemId: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(userId: string, itemId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Wishlist-related methods
  getWishlistItems(userId: string): Promise<WishlistItem[]>;
  addToWishlist(userId: string, productId: string): Promise<WishlistItem>;
  removeFromWishlist(userId: string, productId: string): Promise<void>;
  
  // Order-related methods
  createOrder(userId: string, items: any[], shippingAddress: any, paymentMethod: string): Promise<Order>;
  getUserOrders(userId: string): Promise<Order[]>;
  getOrderDetails(userId: string, orderId: string): Promise<(Order & { items: OrderItem[] }) | undefined>;
  updateOrderStatus(orderId: string, status: string): Promise<Order | undefined>;
  
  // Review-related methods
  getProductReviews(productId: string): Promise<Review[]>;
  addReview(userId: string, productId: string, rating: number, review: string): Promise<Review>;
  
  // Contact-related methods
  submitContactForm(submission: any): Promise<ContactSubmission>;
  
  // Newsletter-related methods
  subscribeToNewsletter(email: string): Promise<NewsletterSubscriber>;
  
  // Session store
  sessionStore: session.Store;
  
  // Admin-specific methods (optional)
  getAllUsers?: () => Promise<User[]>;
  getAllOrders?: () => Promise<Order[]>;
  createProduct?: (productData: any) => Promise<Product>;
  updateProduct?: (id: string, productData: any) => Promise<Product | undefined>;
  deleteProduct?: (id: string) => Promise<void>;
  createCategory?: (categoryData: any) => Promise<Category>;
  updateCategory?: (id: string, categoryData: any) => Promise<Category | undefined>;
  deleteCategory?: (id: string) => Promise<void>;
  getContactSubmissions?: (resolved?: boolean) => Promise<ContactSubmission[]>;
  updateContactSubmissionStatus?: (id: string, isResolved: boolean) => Promise<ContactSubmission | undefined>;
}

// MongoDB session store setup
export const getMongoSessionStore = () => {
  const MongoStore = connectMongo(session);
  
  return new MongoStore({
    mongoUrl: process.env.MONGODB_URL || process.env.MONGO_URI,
    ttl: 14 * 24 * 60 * 60, // 14 days session expiration time
    autoRemove: 'native', // Use MongoDB's TTL index
    touchAfter: 24 * 3600, // Touch session only once in 24 hours for better performance
    autoReconnect: true, // Auto reconnect when connection is lost
    ssl: true,
    sslValidate: true,
  });
};

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async getUserByMobile(mobile: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.mobile === mobile
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = { 
      ...user, 
      id,
      createdAt: new Date(),
      updatedAt: new Date() 
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...userData,
      updatedAt: new Date(),
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Product-related methods
  async getProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    // Apply category filter
    if (options.category) {
      products = products.filter(p => p.category === options.category);
    }
    
    // Apply subcategory filter
    if (options.subcategory) {
      products = products.filter(p => p.subcategory === options.subcategory);
    }
    
    // Apply sorting
    if (options.sort) {
      switch (options.sort) {
        case 'price-asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          break;
        case 'rating':
          products.sort((a, b) => b.rating - a.rating);
          break;
        // Default is 'featured', no sorting needed
      }
    }
    
    // Apply limit
    if (options.limit && options.limit > 0) {
      products = products.slice(0, options.limit);
    }
    
    return products;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.slug === slug,
    );
  }
  
  async getSimilarProducts(productId: number, limit: number = 4): Promise<Product[]> {
    const product = this.products.get(productId);
    if (!product) return [];
    
    // Get products in the same category/subcategory
    const similarProducts = Array.from(this.products.values())
      .filter(p => p.id !== productId && 
                 (p.category === product.category || 
                  p.subcategory === product.subcategory))
      .slice(0, limit);
    
    return similarProducts;
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    if (!query) return [];
    
    const searchTerm = query.toLowerCase();
    return Array.from(this.products.values()).filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.subcategory?.toLowerCase().includes(searchTerm)
    );
  }

  // Category-related methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug,
    );
  }
  
  async getSubcategories(categoryId: number): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(
      (category) => category.parentId === categoryId,
    );
  }

  // Cart-related methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId,
    );
  }

  async addToCart(
    userId: number, 
    productId: number, 
    quantity: number = 1, 
    options: { color?: string, size?: string } = {}
  ): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      (item) => item.userId === userId && item.productId === productId,
    );
    
    if (existingItem) {
      // Update existing item
      const updatedItem: CartItem = {
        ...existingItem,
        quantity: existingItem.quantity + quantity,
        ...(options.color && { selectedColor: options.color }),
        ...(options.size && { selectedSize: options.size }),
        updatedAt: new Date(),
      };
      
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    } else {
      // Create new item
      const id = this.currentCartItemId++;
      const newItem: CartItem = {
        id,
        userId,
        productId,
        quantity,
        selectedColor: options.color,
        selectedSize: options.size,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      this.cartItems.set(id, newItem);
      return newItem;
    }
  }
  
  async updateCartItemQuantity(userId: number, itemId: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(itemId);
    if (!item || item.userId !== userId) return undefined;
    
    if (quantity <= 0) {
      await this.removeFromCart(userId, itemId);
      return undefined;
    }
    
    const updatedItem: CartItem = {
      ...item,
      quantity,
      updatedAt: new Date(),
    };
    
    this.cartItems.set(itemId, updatedItem);
    return updatedItem;
  }
  
  async removeFromCart(userId: number, itemId: number): Promise<void> {
    const item = this.cartItems.get(itemId);
    if (item && item.userId === userId) {
      this.cartItems.delete(itemId);
    }
  }
  
  async clearCart(userId: number): Promise<void> {
    Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.userId === userId)
      .forEach(([id, _]) => this.cartItems.delete(id));
  }

  // Wishlist-related methods
  async getWishlistItems(userId: number): Promise<WishlistItem[]> {
    return Array.from(this.wishlistItems.values()).filter(
      (item) => item.userId === userId,
    );
  }
  
  async addToWishlist(userId: number, productId: number): Promise<WishlistItem> {
    // Check if item already exists in wishlist
    const existingItem = Array.from(this.wishlistItems.values()).find(
      (item) => item.userId === userId && item.productId === productId,
    );
    
    if (existingItem) {
      return existingItem;
    } else {
      // Create new item
      const id = this.currentWishlistItemId++;
      const newItem: WishlistItem = {
        id,
        userId,
        productId,
        createdAt: new Date(),
      };
      
      this.wishlistItems.set(id, newItem);
      return newItem;
    }
  }
  
  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    const item = Array.from(this.wishlistItems.values()).find(
      (item) => item.userId === userId && item.productId === productId,
    );
    
    if (item) {
      this.wishlistItems.delete(item.id);
    }
  }

  // Order-related methods
  async createOrder(
    userId: number, 
    items: { productId: number; quantity: number; selectedColor?: string; selectedSize?: string }[], 
    shippingAddress: any, 
    paymentMethod: string
  ): Promise<Order> {
    // Calculate order total
    let total = 0;
    const orderItems: OrderItem[] = [];
    
    for (const item of items) {
      const product = this.products.get(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      
      total += product.price * item.quantity;
      
      // Create order item
      const orderItemId = this.currentOrderItemId++;
      const orderItem: OrderItem = {
        id: orderItemId,
        orderId: this.currentOrderId,
        productId: product.id,
        productName: product.name,
        productImage: product.images[0],
        quantity: item.quantity,
        price: product.price,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        createdAt: new Date(),
      };
      
      orderItems.push(orderItem);
    }
    
    // Create order
    const orderId = this.currentOrderId++;
    const order: Order = {
      id: orderId,
      userId,
      status: "pending",
      total,
      shippingAddress,
      paymentMethod,
      paymentStatus: "pending",
      deliveryCharge: 0, // Set delivery charge (can be calculated based on order value or address)
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Save order and order items
    this.orders.set(orderId, order);
    orderItems.forEach(item => {
      this.orderItems.set(item.id, item);
    });
    
    // Clear the user's cart
    await this.clearCart(userId);
    
    return order;
  }
  
  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getOrderDetails(userId: number, orderId: number): Promise<(Order & { items: OrderItem[] }) | undefined> {
    const order = this.orders.get(orderId);
    if (!order || order.userId !== userId) return undefined;
    
    const items = Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId,
    );
    
    return {
      ...order,
      items,
    };
  }
  
  async updateOrderStatus(orderId: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (!order) return undefined;
    
    const updatedOrder: Order = {
      ...order,
      status,
      updatedAt: new Date(),
    };
    
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }

  // Review-related methods
  async getProductReviews(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter((review) => review.productId === productId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async addReview(userId: number, productId: number, rating: number, review: string): Promise<Review> {
    const id = this.currentReviewId++;
    const newReview: Review = {
      id,
      userId,
      productId,
      rating,
      review,
      isVerified: false,
      createdAt: new Date(),
    };
    
    this.reviews.set(id, newReview);
    
    // Update product rating
    const product = this.products.get(productId);
    if (product) {
      const productReviews = await this.getProductReviews(productId);
      const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / productReviews.length;
      
      const updatedProduct: Product = {
        ...product,
        rating: parseFloat(averageRating.toFixed(1)),
        reviewCount: productReviews.length,
        updatedAt: new Date(),
      };
      
      this.products.set(productId, updatedProduct);
    }
    
    return newReview;
  }

  // Contact-related methods
  async submitContactForm(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = this.currentContactSubmissionId++;
    const newSubmission: ContactSubmission = {
      ...submission,
      id,
      isResolved: false,
      createdAt: new Date(),
    };
    
    this.contactSubmissions.set(id, newSubmission);
    return newSubmission;
  }

  // Newsletter-related methods
  async subscribeToNewsletter(email: string): Promise<NewsletterSubscriber> {
    // Check if email already exists
    const existingSubscriber = Array.from(this.newsletterSubscribers.values()).find(
      (subscriber) => subscriber.email === email,
    );
    
    if (existingSubscriber) {
      // If inactive, reactivate
      if (!existingSubscriber.isActive) {
        const updatedSubscriber: NewsletterSubscriber = {
          ...existingSubscriber,
          isActive: true,
        };
        
        this.newsletterSubscribers.set(existingSubscriber.id, updatedSubscriber);
        return updatedSubscriber;
      }
      
      return existingSubscriber;
    } else {
      // Create new subscriber
      const id = this.currentNewsletterSubscriberId++;
      const newSubscriber: NewsletterSubscriber = {
        id,
        email,
        isActive: true,
        createdAt: new Date(),
      };
      
      this.newsletterSubscribers.set(id, newSubscriber);
      return newSubscriber;
    }
  }
}

import { MongoDBStorage } from './mongodb-storage';

// Use MongoDB storage implementation
const storage = new MongoDBStorage(); // MongoDB storage for production

export { storage };
