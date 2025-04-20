import type { 
  User, 
  Product, 
  Category,
  Brand,
  CartItem,
  WishlistItem,
  Order,
  OrderItem,
  Review,
  ContactSubmission,
  NewsletterSubscriber,
  DashboardConfig,
  Widget,
  InsertDashboardConfig
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
  
  // Brand-related methods
  getBrands(): Promise<Brand[]>;
  getBrandById(id: string): Promise<Brand | undefined>;
  getBrandBySlug(slug: string): Promise<Brand | undefined>;
  getProductsByBrand(brandId: string): Promise<Product[]>;
  
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
  
  // Dashboard configuration methods
  getDashboardConfig(userId: string): Promise<DashboardConfig | null>;
  createDashboardConfig(config: InsertDashboardConfig): Promise<DashboardConfig>;
  updateDashboardConfig(userId: string, config: Partial<DashboardConfig>): Promise<DashboardConfig | null>;
  updateWidgetPositions(userId: string, widgets: { id: string, position: { x: number, y: number, w: number, h: number } }[]): Promise<DashboardConfig | null>;
  toggleWidgetVisibility(userId: string, widgetId: string, isVisible: boolean): Promise<DashboardConfig | null>;
  
  // Admin-specific methods (optional)
  getAllUsers?: () => Promise<User[]>;
  getAllOrders?: () => Promise<Order[]>;
  createProduct?: (productData: any) => Promise<Product>;
  updateProduct?: (id: string, productData: any) => Promise<Product | undefined>;
  deleteProduct?: (id: string) => Promise<void>;
  // Product variant methods
  addProductVariant?: (productId: string, variantData: any) => Promise<Product | undefined>;
  updateProductVariant?: (productId: string, variantId: string, variantData: any) => Promise<Product | undefined>;
  deleteProductVariant?: (productId: string, variantId: string) => Promise<Product | undefined>;
  // Category methods
  createCategory?: (categoryData: any) => Promise<Category>;
  updateCategory?: (id: string, categoryData: any) => Promise<Category | undefined>;
  deleteCategory?: (id: string) => Promise<void>;
  getCategoryById?: (id: string) => Promise<Category | undefined>; 
  
  // Brand methods
  createBrand?: (brandData: any) => Promise<Brand>;
  updateBrand?: (id: string, brandData: any) => Promise<Brand | undefined>;
  deleteBrand?: (id: string) => Promise<void>;
  getFeaturedBrands?: (limit?: number) => Promise<Brand[]>;
  
  getContactSubmissions?: (resolved?: boolean) => Promise<ContactSubmission[]>;
  updateContactSubmissionStatus?: (id: string, isResolved: boolean) => Promise<ContactSubmission | undefined>;
}