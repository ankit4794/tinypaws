import { IStorage } from './storage';
import prisma from './prisma';
import type { 
  User, 
  Product, 
  Category,
  CartItem,
  WishlistItem,
  Order,
  OrderItem,
  Review,
  ContactSubmission,
  NewsletterSubscriber
} from '@prisma/client';
import session from 'express-session';
import connectMongo from 'connect-mongo';

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
    // Create the session store directly
    this.sessionStore = connectMongo.create({
      mongoUrl: process.env.MONGODB_URL || process.env.DATABASE_URL || '',
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60, // 14 days
    });
  }

  // User-related methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      return await prisma.user.findUnique({
        where: { id }
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      return await prisma.user.findUnique({
        where: { username }
      });
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async createUser(userData: any): Promise<User> {
    try {
      return await prisma.user.create({
        data: userData
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<any>): Promise<User | undefined> {
    try {
      return await prisma.user.update({
        where: { id },
        data: userData
      });
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  // Product-related methods
  async getProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
    try {
      const { category, subcategory, sort, limit } = options;
      
      // Build where condition based on filters
      const whereCondition: any = { isActive: true };
      
      if (category) {
        const categoryRecord = await prisma.category.findUnique({
          where: { slug: category }
        });
        
        if (categoryRecord) {
          whereCondition.categoryId = categoryRecord.id;
        }
      }
      
      // Order by logic
      let orderBy: any = { createdAt: 'desc' };
      if (sort === 'price-low-high') {
        orderBy = { price: 'asc' };
      } else if (sort === 'price-high-low') {
        orderBy = { price: 'desc' };
      } else if (sort === 'name-a-z') {
        orderBy = { name: 'asc' };
      } else if (sort === 'name-z-a') {
        orderBy = { name: 'desc' };
      } else if (sort === 'newest') {
        orderBy = { createdAt: 'desc' };
      } else if (sort === 'rating') {
        orderBy = { rating: 'desc' };
      }
      
      return await prisma.product.findMany({
        where: whereCondition,
        orderBy,
        take: limit ? limit : undefined,
        include: {
          category: true
        }
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | undefined> {
    try {
      return await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          reviews: {
            include: {
              user: {
                select: {
                  username: true,
                  fullName: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return undefined;
    }
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    try {
      return await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          reviews: {
            include: {
              user: {
                select: {
                  username: true,
                  fullName: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching product by slug:', error);
      return undefined;
    }
  }

  async getSimilarProducts(productId: string, limit: number = 4): Promise<Product[]> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { categoryId: true }
      });
      
      if (!product) return [];
      
      return await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: productId },
          isActive: true
        },
        take: limit,
        orderBy: { rating: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching similar products:', error);
      return [];
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      return await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } }
          ],
          isActive: true
        },
        orderBy: { rating: 'desc' },
        take: 20
      });
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // Category-related methods
  async getCategories(): Promise<Category[]> {
    try {
      return await prisma.category.findMany({
        where: {
          isActive: true,
          parentId: null // Return only main categories
        },
        include: {
          subCategories: {
            where: { isActive: true }
          }
        },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    try {
      return await prisma.category.findUnique({
        where: { slug },
        include: {
          subCategories: {
            where: { isActive: true }
          },
          parent: true
        }
      });
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      return undefined;
    }
  }

  async getSubcategories(categoryId: string): Promise<Category[]> {
    try {
      return await prisma.category.findMany({
        where: {
          parentId: categoryId,
          isActive: true
        },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      return [];
    }
  }

  // Cart-related methods
  async getCartItems(userId: string): Promise<CartItem[]> {
    try {
      return await prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: true
        },
        orderBy: { createdAt: 'desc' }
      });
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
      // Check if item already exists in cart
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          userId,
          productId,
          selectedColor: options?.color,
          selectedSize: options?.size
        }
      });
      
      if (existingItem) {
        // Update quantity if item exists
        return await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + quantity,
            updatedAt: new Date()
          },
          include: { product: true }
        });
      } else {
        // Create new cart item
        return await prisma.cartItem.create({
          data: {
            userId,
            productId,
            quantity,
            selectedColor: options?.color,
            selectedSize: options?.size
          },
          include: { product: true }
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItemQuantity(userId: string, itemId: string, quantity: number): Promise<CartItem | undefined> {
    try {
      // Verify the cart item belongs to the user
      const cartItem = await prisma.cartItem.findFirst({
        where: {
          id: itemId,
          userId
        }
      });
      
      if (!cartItem) return undefined;
      
      return await prisma.cartItem.update({
        where: { id: itemId },
        data: {
          quantity,
          updatedAt: new Date()
        },
        include: { product: true }
      });
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      return undefined;
    }
  }

  async removeFromCart(userId: string, itemId: string): Promise<void> {
    try {
      // Verify the cart item belongs to the user
      const cartItem = await prisma.cartItem.findFirst({
        where: {
          id: itemId,
          userId
        }
      });
      
      if (!cartItem) return;
      
      await prisma.cartItem.delete({
        where: { id: itemId }
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }

  async clearCart(userId: string): Promise<void> {
    try {
      await prisma.cartItem.deleteMany({
        where: { userId }
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }

  // Wishlist-related methods
  async getWishlistItems(userId: string): Promise<WishlistItem[]> {
    try {
      return await prisma.wishlistItem.findMany({
        where: { userId },
        include: {
          product: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      return [];
    }
  }

  async addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
    try {
      // Check if product already in wishlist
      const existingItem = await prisma.wishlistItem.findFirst({
        where: {
          userId,
          productId
        }
      });
      
      if (existingItem) {
        return existingItem;
      }
      
      return await prisma.wishlistItem.create({
        data: {
          userId,
          productId
        },
        include: { product: true }
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    try {
      const wishlistItem = await prisma.wishlistItem.findFirst({
        where: {
          userId,
          productId
        }
      });
      
      if (!wishlistItem) return;
      
      await prisma.wishlistItem.delete({
        where: { id: wishlistItem.id }
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
      // Calculate total
      let total = 0;
      for (const item of items) {
        total += item.price * item.quantity;
      }
      
      // Create order
      const order = await prisma.order.create({
        data: {
          userId,
          total,
          shippingAddress,
          paymentMethod,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              productName: item.productName,
              productImage: item.productImage,
              quantity: item.quantity,
              price: item.price,
              selectedColor: item.selectedColor,
              selectedSize: item.selectedSize
            }))
          }
        },
        include: {
          items: true
        }
      });
      
      // Clear cart after order
      await this.clearCart(userId);
      
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      return await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  async getOrderDetails(userId: string, orderId: string): Promise<(Order & { items: OrderItem[] }) | undefined> {
    try {
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
      
      return order as (Order & { items: OrderItem[] });
    } catch (error) {
      console.error('Error fetching order details:', error);
      return undefined;
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | undefined> {
    try {
      return await prisma.order.update({
        where: { id: orderId },
        data: { status: status as any }
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      return undefined;
    }
  }

  // Review-related methods
  async getProductReviews(productId: string): Promise<Review[]> {
    try {
      return await prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              username: true,
              fullName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return [];
    }
  }

  async addReview(userId: string, productId: string, rating: number, review: string): Promise<Review> {
    try {
      // Create the review
      const newReview = await prisma.review.create({
        data: {
          userId,
          productId,
          rating,
          review
        },
        include: {
          user: {
            select: {
              username: true,
              fullName: true
            }
          }
        }
      });
      
      // Update product rating
      const productReviews = await prisma.review.findMany({
        where: { productId }
      });
      
      const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / productReviews.length;
      
      await prisma.product.update({
        where: { id: productId },
        data: {
          rating: averageRating,
          reviewCount: productReviews.length
        }
      });
      
      return newReview;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  // Contact-related methods
  async submitContactForm(submission: InsertContactSubmission): Promise<ContactSubmission> {
    try {
      return await prisma.contactSubmission.create({
        data: submission
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }
  }

  // Newsletter-related methods
  async subscribeToNewsletter(email: string): Promise<NewsletterSubscriber> {
    try {
      // Check if already subscribed
      const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
        where: { email }
      });
      
      if (existingSubscriber) {
        if (!existingSubscriber.isActive) {
          // Reactivate subscription
          return await prisma.newsletterSubscriber.update({
            where: { id: existingSubscriber.id },
            data: { isActive: true }
          });
        }
        return existingSubscriber;
      }
      
      // Create new subscription
      return await prisma.newsletterSubscriber.create({
        data: { email }
      });
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  }

  // Admin-specific methods (for the admin panel)
  async getAllUsers(): Promise<User[]> {
    try {
      return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  async createProduct(productData: any): Promise<Product> {
    try {
      return await prisma.product.create({
        data: productData
      });
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, productData: any): Promise<Product | undefined> {
    try {
      return await prisma.product.update({
        where: { id },
        data: productData
      });
    } catch (error) {
      console.error('Error updating product:', error);
      return undefined;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await prisma.product.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async createCategory(categoryData: any): Promise<Category> {
    try {
      return await prisma.category.create({
        data: categoryData
      });
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(id: string, categoryData: any): Promise<Category | undefined> {
    try {
      return await prisma.category.update({
        where: { id },
        data: categoryData
      });
    } catch (error) {
      console.error('Error updating category:', error);
      return undefined;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await prisma.category.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      return await prisma.order.findMany({
        include: {
          user: {
            select: {
              username: true,
              fullName: true,
              email: true
            }
          },
          items: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  }

  async getContactSubmissions(resolved?: boolean): Promise<ContactSubmission[]> {
    try {
      return await prisma.contactSubmission.findMany({
        where: resolved !== undefined ? { isResolved: resolved } : {},
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      return [];
    }
  }

  async updateContactSubmissionStatus(id: string, isResolved: boolean): Promise<ContactSubmission | undefined> {
    try {
      return await prisma.contactSubmission.update({
        where: { id },
        data: { isResolved }
      });
    } catch (error) {
      console.error('Error updating contact submission status:', error);
      return undefined;
    }
  }
}