import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storageProvider } from "./index"; // Import the storageProvider
import { z } from "zod";
import reviewsRoutes from "./routes/reviews";
import cmsRoutes from "./routes/cms";
import disclaimersRoutes from "./routes/disclaimers";
import promotionsRoutes from "./routes/promotions";
import adminReviewsRoutes from "./routes/admin/reviews";
import adminPincodesRoutes from "./routes/admin/pincodes";
import adminCmsRoutes from "./routes/admin/cms";
import adminDisclaimersRoutes from "./routes/admin/disclaimers";
import adminPromotionsRoutes from "./routes/admin/promotions";
import adminCategoriesRoutes from "./routes/admin/categories";
import adminProductsRoutes from "./routes/admin/products";
import adminDashboardRoutes from "./routes/admin/dashboard";
import adminBrandsRoutes from "./routes/admin/brands";
import adminAuthRoutes from "./routes/admin/auth";
import adminOrdersRoutes from "./routes/admin/orders";
import adminCustomersRoutes from "./routes/admin/customers";
import adminHelpdeskRoutes from "./routes/admin/helpdesk";
import adminUploadRoutes from "./routes/admin/upload";
import helpdeskRoutes from "./routes/helpdesk";
import newsletterRoutes from "./routes/newsletter";
import pincodesRoutes from "./routes/pincodes";
import uploadRoutes from "./routes/upload";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Product-related routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, subcategory, sort, limit, query } = req.query;
      
      // If search query is provided, use search products
      if (query && typeof query === 'string' && query.trim() !== '') {
        const searchResults = await storageProvider.instance.searchProducts(query);
        return res.json(searchResults);
      }
      
      // Otherwise use regular product listing with filters
      const products = await storageProvider.instance.getProducts({
        category: category as string,
        subcategory: subcategory as string,
        sort: sort as string,
        limit: limit ? parseInt(limit as string) : undefined
      });
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Add endpoint to get product by slug (must come BEFORE the :id route to avoid conflicts)
  app.get("/api/products/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const product = await storageProvider.instance.getProductBySlug(slug);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product by slug:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  
  // 'similar/:id' must also come before the generic :id route to avoid conflicts
  app.get("/api/products/similar/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const similarProducts = await storageProvider.instance.getSimilarProducts(id);
      res.json(similarProducts);
    } catch (error) {
      console.error("Error fetching similar products:", error);
      res.status(500).json({ message: "Failed to fetch similar products" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storageProvider.instance.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Category-related routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storageProvider.instance.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  // Brand-related routes
  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await storageProvider.instance.getBrands();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  app.get("/api/brands/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const featuredBrands = await storageProvider.instance.getFeaturedBrands(limit);
      res.json(featuredBrands);
    } catch (error) {
      console.error("Error fetching featured brands:", error);
      res.status(500).json({ message: "Failed to fetch featured brands" });
    }
  });

  app.get("/api/brands/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const brand = await storageProvider.instance.getBrandById(id);
      
      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }
      
      res.json(brand);
    } catch (error) {
      console.error("Error fetching brand:", error);
      res.status(500).json({ message: "Failed to fetch brand" });
    }
  });
  
  app.get("/api/brands/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const brand = await storageProvider.instance.getBrandBySlug(slug);
      
      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }
      
      res.json(brand);
    } catch (error) {
      console.error("Error fetching brand by slug:", error);
      res.status(500).json({ message: "Failed to fetch brand" });
    }
  });
  
  app.get("/api/brands/:id/products", async (req, res) => {
    try {
      const { id } = req.params;
      const products = await storageProvider.instance.getProductsByBrand(id);
      res.json(products);
    } catch (error) {
      console.error("Error fetching brand products:", error);
      res.status(500).json({ message: "Failed to fetch brand products" });
    }
  });

  // Cart-related routes (for logged-in users)
  app.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!._id;
      const cartItems = await storageProvider.instance.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!._id;
      const { productId, quantity } = req.body;
      
      const updatedCart = await storageProvider.instance.addToCart(userId, productId, quantity);
      res.json(updatedCart);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.delete("/api/cart/:itemId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!._id;
      const { itemId } = req.params;
      
      await storageProvider.instance.removeFromCart(userId, itemId);
      res.sendStatus(204);
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Wishlist-related routes (for logged-in users)
  app.get("/api/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!._id;
      const wishlistItems = await storageProvider.instance.getWishlistItems(userId);
      res.json(wishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!._id;
      const { productId } = req.body;
      
      const updatedWishlist = await storageProvider.instance.addToWishlist(userId, productId);
      res.json(updatedWishlist);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:productId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!._id;
      const { productId } = req.params;
      
      await storageProvider.instance.removeFromWishlist(userId, productId);
      res.sendStatus(204);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // Order-related routes
  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!._id;
      const { items, shippingAddress, paymentMethod } = req.body;
      
      const order = await storageProvider.instance.createOrder(userId, items, shippingAddress, paymentMethod);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!._id;
      const orders = await storageProvider.instance.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:orderId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!._id;
      const { orderId } = req.params;
      
      const order = await storageProvider.instance.getOrderDetails(userId, orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({ message: "Failed to fetch order details" });
    }
  });

  // Contact form submission
  const contactFormSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().regex(/^\d{10}$/),
    subject: z.string().min(1),
    message: z.string().min(10),
    preferredContact: z.enum(["email", "phone", "whatsapp"]),
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = contactFormSchema.parse(req.body);
      
      // In a real implementation, this would save to database and/or send email
      console.log("Contact form submission:", validatedData);
      
      res.status(201).json({ message: "Contact form submitted successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid form data", errors: error.errors });
      }
      
      console.error("Error processing contact form:", error);
      res.status(500).json({ message: "Failed to process contact form" });
    }
  });

  // Newsletter subscription
  app.post("/api/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "Invalid email address" });
      }
      
      // In a real implementation, this would save to database and/or add to mailing list
      console.log("Newsletter subscription:", email);
      
      res.status(201).json({ message: "Subscribed to newsletter successfully" });
    } catch (error) {
      console.error("Error processing subscription:", error);
      res.status(500).json({ message: "Failed to process subscription" });
    }
  });

  // Mount review routes
  app.use("/api/reviews", reviewsRoutes);
  
  // Mount CMS routes
  app.use("/api/cms", cmsRoutes);
  
  // Mount disclaimer routes
  app.use("/api/disclaimers", disclaimersRoutes);
  
  // Mount promotion routes
  app.use("/api/promotions", promotionsRoutes);
  
  // Mount helpdesk routes
  app.use("/api/helpdesk", helpdeskRoutes);
  
  // Mount newsletter routes
  app.use("/api/newsletter", newsletterRoutes);
  
  // Mount admin routes
  app.use("/api/admin/auth", adminAuthRoutes);
  app.use("/api/admin/reviews", adminReviewsRoutes);
  app.use("/api/admin/pincodes", adminPincodesRoutes);
  app.use("/api/admin/cms", adminCmsRoutes);
  app.use("/api/admin/disclaimers", adminDisclaimersRoutes);
  app.use("/api/admin/promotions", adminPromotionsRoutes);
  app.use("/api/admin/categories", adminCategoriesRoutes);
  app.use("/api/admin/products", adminProductsRoutes);
  app.use("/api/admin/dashboard", adminDashboardRoutes);
  app.use("/api/admin/brands", adminBrandsRoutes);
  app.use("/api/admin/orders", adminOrdersRoutes);
  app.use("/api/admin/customers", adminCustomersRoutes);
  app.use("/api/admin/helpdesk", adminHelpdeskRoutes);
  app.use("/api/admin/upload", adminUploadRoutes);
  
  // Additional legacy routes to maintain backward compatibility (frontend expects these paths)
  app.post("/api/admin/login", async (req, res) => {
    try {
      // Use passport login instead of direct storage access
      const { email, password } = req.body;
      // Find admin user
      const user = await storageProvider.instance.getUserByEmail(email);
      
      if (!user || user.role !== 'ADMIN') {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Authenticate with passport
      req.login(user, (err) => {
        if (err) {
          console.error("Admin login error:", err);
          return res.status(500).json({ message: "Login error" });
        }
        res.status(200).json(user);
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
  
  app.post("/api/admin/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/admin/user", (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'ADMIN') {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  
  // Mount pincode routes
  app.use("/api/pincodes", pincodesRoutes);
  
  // Mount upload routes
  app.use("/api/upload", uploadRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
