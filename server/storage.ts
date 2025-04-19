import { users, products, categories, cartItems, wishlistItems, orders, orderItems, reviews, contactSubmissions, newsletterSubscribers } from "@shared/schema";
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
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Product filter options interface
interface ProductFilterOptions {
  category?: string;
  subcategory?: string;
  sort?: string;
  limit?: number;
}

export interface IStorage {
  // User-related methods
  getUser(id: string | number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByMobile(mobile: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  updateUser(id: string | number, userData: Partial<any>): Promise<User | undefined>;
  
  // Product-related methods
  getProducts(options?: ProductFilterOptions): Promise<Product[]>;
  getProductById(id: string | number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getSimilarProducts(productId: string | number, limit?: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Category-related methods
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getSubcategories(categoryId: string | number): Promise<Category[]>;
  
  // Cart-related methods
  getCartItems(userId: string | number): Promise<CartItem[]>;
  addToCart(userId: string | number, productId: string | number, quantity?: number, options?: { color?: string, size?: string }): Promise<CartItem>;
  updateCartItemQuantity(userId: string | number, itemId: string | number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(userId: string | number, itemId: string | number): Promise<void>;
  clearCart(userId: string | number): Promise<void>;
  
  // Wishlist-related methods
  getWishlistItems(userId: string | number): Promise<WishlistItem[]>;
  addToWishlist(userId: string | number, productId: string | number): Promise<WishlistItem>;
  removeFromWishlist(userId: string | number, productId: string | number): Promise<void>;
  
  // Order-related methods
  createOrder(userId: string | number, items: any[], shippingAddress: any, paymentMethod: string): Promise<Order>;
  getUserOrders(userId: string | number): Promise<Order[]>;
  getOrderDetails(userId: string | number, orderId: string | number): Promise<(Order & { items: OrderItem[] }) | undefined>;
  updateOrderStatus(orderId: string | number, status: string): Promise<Order | undefined>;
  
  // Review-related methods
  getProductReviews(productId: string | number): Promise<Review[]>;
  addReview(userId: string | number, productId: string | number, rating: number, review: string): Promise<Review>;
  
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
  updateProduct?: (id: string | number, productData: any) => Promise<Product | undefined>;
  deleteProduct?: (id: string | number) => Promise<void>;
  createCategory?: (categoryData: any) => Promise<Category>;
  updateCategory?: (id: string | number, categoryData: any) => Promise<Category | undefined>;
  deleteCategory?: (id: string | number) => Promise<void>;
  getContactSubmissions?: (resolved?: boolean) => Promise<ContactSubmission[]>;
  updateContactSubmissionStatus?: (id: string | number, isResolved: boolean) => Promise<ContactSubmission | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private cartItems: Map<number, CartItem>;
  private wishlistItems: Map<number, WishlistItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private reviews: Map<number, Review>;
  private contactSubmissions: Map<number, ContactSubmission>;
  private newsletterSubscribers: Map<number, NewsletterSubscriber>;
  
  sessionStore: session.Store;
  currentUserId: number;
  currentProductId: number;
  currentCategoryId: number;
  currentCartItemId: number;
  currentWishlistItemId: number;
  currentOrderId: number;
  currentOrderItemId: number;
  currentReviewId: number;
  currentContactSubmissionId: number;
  currentNewsletterSubscriberId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.cartItems = new Map();
    this.wishlistItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.reviews = new Map();
    this.contactSubmissions = new Map();
    this.newsletterSubscribers = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCategoryId = 1;
    this.currentCartItemId = 1;
    this.currentWishlistItemId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentReviewId = 1;
    this.currentContactSubmissionId = 1;
    this.currentNewsletterSubscriberId = 1;
    
    this.initializeData();
  }

  // Initialize sample data for development
  private initializeData() {
    // Initialize categories
    const categoryData: InsertCategory[] = [
      {
        name: "Dogs",
        slug: "dogs",
        description: "Products for dogs",
        image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1969&q=80",
        isActive: true,
      },
      {
        name: "Cats",
        slug: "cats",
        description: "Products for cats",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2043&q=80",
        isActive: true,
      },
      {
        name: "Small Animals",
        slug: "small-animals",
        description: "Products for small animals",
        image: "https://images.unsplash.com/photo-1591561582301-7ce6587cc286?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
        isActive: true,
      }
    ];
    
    // Add subcategories
    const subcategoryData: InsertCategory[] = [
      // Dog subcategories
      {
        name: "Food",
        slug: "dogs/food",
        description: "Food for dogs",
        parentId: 1,
        isActive: true,
      },
      {
        name: "Treats",
        slug: "dogs/treats",
        description: "Treats for dogs",
        parentId: 1,
        isActive: true,
      },
      {
        name: "Toys",
        slug: "dogs/toys",
        description: "Toys for dogs",
        parentId: 1,
        isActive: true,
      },
      {
        name: "Accessories",
        slug: "dogs/accessories",
        description: "Accessories for dogs",
        parentId: 1,
        isActive: true,
      },
      {
        name: "Grooming",
        slug: "dogs/grooming",
        description: "Grooming products for dogs",
        parentId: 1,
        isActive: true,
      },
      
      // Cat subcategories
      {
        name: "Food",
        slug: "cats/food",
        description: "Food for cats",
        parentId: 2,
        isActive: true,
      },
      {
        name: "Litter & Accessories",
        slug: "cats/litter",
        description: "Litter and accessories for cats",
        parentId: 2,
        isActive: true,
      },
      {
        name: "Toys",
        slug: "cats/toys",
        description: "Toys for cats",
        parentId: 2,
        isActive: true,
      },
      {
        name: "Accessories",
        slug: "cats/accessories",
        description: "Accessories for cats",
        parentId: 2,
        isActive: true,
      },
      {
        name: "Grooming",
        slug: "cats/grooming",
        description: "Grooming products for cats",
        parentId: 2,
        isActive: true,
      },
      
      // Small Animals subcategories
      {
        name: "Birds",
        slug: "small-animals/birds",
        description: "Products for birds",
        parentId: 3,
        isActive: true,
      },
      {
        name: "Fish",
        slug: "small-animals/fish",
        description: "Products for fish",
        parentId: 3,
        isActive: true,
      },
      {
        name: "Hamsters",
        slug: "small-animals/hamsters",
        description: "Products for hamsters",
        parentId: 3,
        isActive: true,
      },
      {
        name: "Rabbits",
        slug: "small-animals/rabbits",
        description: "Products for rabbits",
        parentId: 3,
        isActive: true,
      }
    ];
    
    // Initialize products
    const productData: InsertProduct[] = [
      {
        name: "Premium Dog Food",
        slug: "premium-dog-food",
        description: "High-quality dog food with balanced nutrition",
        longDescription: "<p>Our premium dog food is specially formulated to provide complete and balanced nutrition for dogs of all ages. Made with real chicken as the first ingredient, this food supports healthy muscles and energy levels.</p><p>Key benefits include:</p><ul><li>Rich in protein for muscle development</li><li>Contains omega fatty acids for healthy skin and coat</li><li>Added vitamins and minerals for immune support</li><li>No artificial colors, flavors, or preservatives</li></ul>",
        price: 79900, // ₹799
        originalPrice: 99900, // ₹999
        images: [
          "https://images.unsplash.com/photo-1585846888969-42ae2458f267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
        ],
        category: "dogs",
        subcategory: "food",
        brand: "Royal Canin",
        features: [
          "Made with real chicken",
          "No artificial preservatives",
          "Supports healthy digestion",
          "Contains essential vitamins and minerals"
        ],
        rating: 4.5,
        reviewCount: 42,
        stock: 100,
        isActive: true,
      },
      {
        name: "Cat Scratching Post",
        slug: "cat-scratching-post",
        description: "Durable cat scratching post for feline friends",
        longDescription: "<p>Give your cat a dedicated place to sharpen their claws with our premium scratching post. This sturdy post is covered in natural sisal rope which cats love to scratch and helps save your furniture from damage.</p><p>The wide base provides stability, and the plush toy on top adds an element of play to entice your cat to use it regularly.</p>",
        price: 149900, // ₹1,499
        originalPrice: 189900, // ₹1,899
        images: [
          "https://images.unsplash.com/photo-1623620387429-89ac15da10dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1958&q=80"
        ],
        category: "cats",
        subcategory: "accessories",
        brand: "PetZilla",
        features: [
          "Natural sisal rope covering",
          "Sturdy base for stability",
          "Plush toy on top",
          "Easy to assemble"
        ],
        rating: 5.0,
        reviewCount: 37,
        stock: 50,
        isActive: true,
      },
      {
        name: "Durable Dog Leash",
        slug: "durable-dog-leash",
        description: "Strong and comfortable dog leash for walks",
        longDescription: "<p>Our premium quality dog leash is made with durable materials for your furry friend's safety and comfort. Features a comfortable padded handle and reflective stitching for night-time visibility.</p><p>Available in multiple colors and sizes to suit dogs of all breeds and sizes. The strong metal clip ensures secure attachment to your dog's collar or harness.</p>",
        price: 69900, // ₹699
        originalPrice: 89900, // ₹899
        images: [
          "https://images.unsplash.com/photo-1592948078472-4b015cf88c9d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1560743641-3914f2c45636?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
          "https://images.unsplash.com/photo-1541599468348-e96984315921?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1972&q=80"
        ],
        category: "dogs",
        subcategory: "accessories",
        brand: "Kong",
        features: [
          "Made with high-quality nylon",
          "Comfortable padded handle",
          "Reflective stitching for night visibility",
          "Strong metal clip"
        ],
        rating: 4.0,
        reviewCount: 29,
        stock: 75,
        isActive: true,
      },
      {
        name: "Deluxe Hamster Cage",
        slug: "deluxe-hamster-cage",
        description: "Spacious and comfortable cage for hamsters",
        longDescription: "<p>Create a perfect home for your hamster with our deluxe cage setup. This multi-level habitat provides plenty of space for exercise and exploration with ramps, tunnels, and platforms.</p><p>The deep plastic base prevents bedding from being kicked out, and the secure wire top ensures proper ventilation while keeping your pet safely contained. Includes a quiet exercise wheel, water bottle, and food dish.</p>",
        price: 249900, // ₹2,499
        originalPrice: 299900, // ₹2,999
        images: [
          "https://images.unsplash.com/photo-1618053935231-4c1f6e6c1336?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
        ],
        category: "small-animals",
        subcategory: "hamsters",
        brand: "PetZilla",
        features: [
          "Multiple levels for exercise",
          "Deep base to contain bedding",
          "Includes exercise wheel and accessories",
          "Easy to clean and assemble"
        ],
        rating: 4.5,
        reviewCount: 18,
        stock: 30,
        isActive: true,
      }
    ];
    
    // Add all categories
    categoryData.forEach(category => {
      this.categories.set(this.currentCategoryId, {
        ...category,
        id: this.currentCategoryId++,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    
    // Add all subcategories
    subcategoryData.forEach(subcategory => {
      this.categories.set(this.currentCategoryId, {
        ...subcategory,
        id: this.currentCategoryId++,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    
    // Add all products
    productData.forEach(product => {
      this.products.set(this.currentProductId, {
        ...product,
        id: this.currentProductId++,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  // User-related methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

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

// Choose which storage implementation to use:
const storage = new MemStorage(); // In-memory storage for development
// const storage = new MongoDBStorage(); // MongoDB storage for production

export { storage };
