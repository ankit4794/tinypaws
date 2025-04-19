import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
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
import pincodesRoutes from "./routes/pincodes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Product-related routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, subcategory, sort, limit } = req.query;
      
      const products = await storage.getProducts({
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

  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProductById(parseInt(id));
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get("/api/products/similar/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const similarProducts = await storage.getSimilarProducts(parseInt(id));
      res.json(similarProducts);
    } catch (error) {
      console.error("Error fetching similar products:", error);
      res.status(500).json({ message: "Failed to fetch similar products" });
    }
  });

  // Category-related routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Cart-related routes (for logged-in users)
  app.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const cartItems = await storage.getCartItems(userId);
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
      const userId = req.user!.id;
      const { productId, quantity } = req.body;
      
      const updatedCart = await storage.addToCart(userId, productId, quantity);
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
      const userId = req.user!.id;
      const { itemId } = req.params;
      
      await storage.removeFromCart(userId, parseInt(itemId));
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
      const userId = req.user!.id;
      const wishlistItems = await storage.getWishlistItems(userId);
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
      const userId = req.user!.id;
      const { productId } = req.body;
      
      const updatedWishlist = await storage.addToWishlist(userId, productId);
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
      const userId = req.user!.id;
      const { productId } = req.params;
      
      await storage.removeFromWishlist(userId, parseInt(productId));
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
      const userId = req.user!.id;
      const { items, shippingAddress, paymentMethod } = req.body;
      
      const order = await storage.createOrder(userId, items, shippingAddress, paymentMethod);
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
      const userId = req.user!.id;
      const orders = await storage.getUserOrders(userId);
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
      const userId = req.user!.id;
      const { orderId } = req.params;
      
      const order = await storage.getOrderDetails(userId, parseInt(orderId));
      
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
  
  // Mount admin routes
  app.use("/api/admin/reviews", adminReviewsRoutes);
  app.use("/api/admin/pincodes", adminPincodesRoutes);
  app.use("/api/admin/cms", adminCmsRoutes);
  app.use("/api/admin/disclaimers", adminDisclaimersRoutes);
  app.use("/api/admin/promotions", adminPromotionsRoutes);
  
  // Mount pincode routes
  app.use("/api/pincodes", pincodesRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
