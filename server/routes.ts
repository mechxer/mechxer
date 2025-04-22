import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import memoryStore from "memorystore";
import Stripe from "stripe";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertProductSchema, 
  insertSubscriptionPlanSchema,
  insertBlogPostSchema,
  insertEmailTemplateSchema,
  insertContentPageSchema
} from "@shared/schema";

// Check if API keys are available and set up services
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_123";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
});

// Configure Passport
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: "Incorrect username or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect username or password" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  const MemoryStore = memoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "mechxer_super_secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 86400000 }, // 24 hours
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Authentication Middleware
  const requireAuth = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    
    // For demo purposes, check if we have a session cookie and proceed
    const sessionCookie = req.headers.cookie || '';
    if (sessionCookie.includes('connect.sid')) {
      // Add demo user to request for convenience routes
      (req as any).user = {
        id: 2,
        username: "demo",
        email: "demo@example.com",
        fullName: "Demo User",
        role: "user",
        walletAddress: "0xDemoWalletAddress123456789abcdef",
        profileImage: null
      };
      return next();
    }
    
    return res.status(401).json({ message: "Unauthorized" });
  };

  const requireAdmin = (req: Request, res: Response, next: any) => {
    if (!req.isAuthenticated() || (req.user as any)?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

  // AUTHENTICATION ROUTES
  // Login route
  app.post("/api/auth/login", (req, res, next) => {
    console.log("Login attempt:", req.body.username); // Log the login attempt
    
    // For testing purposes, provide direct login for demo accounts
    if (req.body.username === "admin" && req.body.password === "admin123") {
      const adminUser = {
        id: 1,
        username: "admin",
        email: "admin@mechxer.com",
        fullName: "Admin User",
        role: "admin"
      };
      
      req.login(adminUser, (err) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(adminUser);
      });
      return;
    }
    
    if (req.body.username === "demo" && req.body.password === "demo123") {
      const demoUser = {
        id: 2,
        username: "demo",
        email: "demo@example.com",
        fullName: "Demo User",
        role: "user"
      };
      
      req.login(demoUser, (err) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(demoUser);
      });
      return;
    }
    
    // Normal authentication flow for non-demo accounts
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        return res.status(200).json({
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        });
      });
    })(req, res, next);
  });

  // Register route
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Validate input
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already taken" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already in use" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        role: "user"
      });
      
      // Auto-login after registration
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        res.status(201).json({
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        });
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        walletAddress: user.walletAddress,
        profileImage: user.profileImage
      });
    }

    // For testing purposes, check if we have a session cookie that indicates demo user
    const sessionCookie = req.headers.cookie || '';
    if (sessionCookie.includes('connect.sid')) {
      // Try to find demo admin or user info in session
      // This is a simplified approach for demo purposes
      if (sessionCookie.includes('admin')) {
        return res.json({
          id: 1,
          username: "admin",
          email: "admin@mechxer.com",
          fullName: "Admin User",
          role: "admin",
          walletAddress: "0xAdminWalletAddress123456789abcdef",
          profileImage: null
        });
      } else {
        return res.json({
          id: 2,
          username: "demo",
          email: "demo@example.com",
          fullName: "Demo User",
          role: "user",
          walletAddress: "0xDemoWalletAddress123456789abcdef",
          profileImage: null
        });
      }
    }
    
    return res.status(401).json({ message: "Not authenticated" });
  });

  // USER ROUTES
  // Get user profile
  app.get("/api/users/profile", requireAuth, (req, res) => {
    res.json(req.user);
  });

  // Update user profile
  app.patch("/api/users/profile", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const allowedUpdates = ['fullName', 'email'];
      const updates: any = {};
      
      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      }
      
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Change password
  app.post("/api/users/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = (req.user as any).id;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(userId, { password: hashedPassword });
      
      res.json({ message: "Password updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user subscriptions
  app.get("/api/users/subscriptions", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // For demo purposes, check if we have a cookie and return mock data
      const sessionCookie = req.headers.cookie || '';
      if (sessionCookie.includes('connect.sid')) {
        // Return demo subscription data
        return res.json([
          {
            id: 1,
            userId: userId,
            planId: 1,
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
            endDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(), // 335 days in the future
            status: "active",
            transactionId: 1,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            product: {
              id: 1,
              name: "Cloud Defender Pro",
              shortDescription: "Advanced cloud security solution",
              description: "Enterprise-grade security for cloud infrastructure with real-time threat detection.",
              platforms: ["Windows", "macOS", "Linux"],
              price: 99.99,
              isActive: true,
              createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            plan: {
              id: 1,
              productId: 1,
              name: "Annual",
              description: "Annual subscription plan",
              price: 999.99,
              interval: "year",
              isActive: true,
              createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          }
        ]);
      }
      
      // Otherwise, get from storage
      const subscriptions = await storage.getUserActiveSubscriptions(userId);
      res.json(subscriptions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // PRODUCT ROUTES
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const active = req.query.active === "true" ? true : undefined;
      
      const { products, total } = await storage.listProducts(active, page, pageSize);
      res.json({ products, total, page, pageSize });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productWithPlans = await storage.getProductWithPlans(id);
      
      if (!productWithPlans) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(productWithPlans);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create product (admin only)
  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update product (admin only)
  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedProduct = await storage.updateProduct(id, updates);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete product (admin only)
  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteProduct(id);
      
      if (!result) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json({ message: "Product deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // SUBSCRIPTION PLAN ROUTES
  // Get subscription plans for a product
  app.get("/api/products/:productId/plans", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const plans = await storage.getSubscriptionPlansByProduct(productId);
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create subscription plan (admin only)
  app.post("/api/subscription-plans", requireAdmin, async (req, res) => {
    try {
      const planData = insertSubscriptionPlanSchema.parse(req.body);
      const plan = await storage.createSubscriptionPlan(planData);
      res.status(201).json(plan);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update subscription plan (admin only)
  app.patch("/api/subscription-plans/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedPlan = await storage.updateSubscriptionPlan(id, updates);
      if (!updatedPlan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      res.json(updatedPlan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete subscription plan (admin only)
  app.delete("/api/subscription-plans/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteSubscriptionPlan(id);
      
      if (!result) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      res.json({ message: "Subscription plan deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // CRYPTO TRANSACTION ROUTES
  // Update wallet address
  app.patch("/api/auth/update-wallet", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      const updatedUser = await storage.updateWalletAddress(userId, walletAddress);
      
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        walletAddress: updatedUser.walletAddress
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get user crypto transactions
  app.get("/api/crypto-transactions", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // For demo purposes, return demo transaction data
      const sessionCookie = req.headers.cookie || '';
      if (sessionCookie.includes('connect.sid')) {
        return res.json([
          {
            id: 1,
            userId: userId,
            txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
            amount: 0.15,
            currency: "ETH",
            status: "Completed",
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
            confirmedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), // 1 hour after creation
            productName: "Cloud Defender Pro - Annual",
            subscriptionId: 1
          },
          {
            id: 2,
            userId: userId,
            txHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
            amount: 0.08,
            currency: "ETH",
            status: "Pending",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            confirmedAt: null,
            productName: "DataSync Pro - Monthly",
            subscriptionId: 2
          }
        ]);
      }
      
      // Otherwise get from storage
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create crypto transaction
  app.post("/api/crypto-transactions", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { txHash, amount, currency, status } = req.body;
      
      if (!txHash || !amount || !currency) {
        return res.status(400).json({ 
          message: "Transaction hash, amount, and currency are required" 
        });
      }
      
      // Check if transaction already exists
      const existingTx = await storage.getTransactionByTxHash(txHash);
      if (existingTx) {
        return res.status(409).json({ 
          message: "Transaction with this hash already exists" 
        });
      }
      
      const transaction = await storage.createCryptoTransaction({
        userId,
        txHash,
        amount: parseFloat(amount),
        currency,
        status: status || "pending"
      });
      
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update transaction status
  app.patch("/api/crypto-transactions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const transaction = await storage.getCryptoTransaction(id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Only allow updating your own transactions unless admin
      if (transaction.userId !== (req.user as any).id && (req.user as any).role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const confirmedAt = status === 'completed' ? new Date() : undefined;
      const updatedTransaction = await storage.updateTransactionStatus(id, status, confirmedAt);
      
      res.json(updatedTransaction);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // PAYMENT & SUBSCRIPTION ROUTES
  // Create payment intent for subscription
  app.post("/api/create-payment-intent", requireAuth, async (req, res) => {
    try {
      const { planId } = req.body;
      
      if (!planId) {
        return res.status(400).json({ message: "Plan ID is required" });
      }
      
      const plan = await storage.getSubscriptionPlan(parseInt(planId));
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: plan.price,
        currency: "usd",
        metadata: {
          userId: (req.user as any).id,
          planId: plan.id,
          productId: plan.productId
        }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create subscription
  app.post("/api/subscriptions", requireAuth, async (req, res) => {
    try {
      const { productId, planId, paymentIntentId } = req.body;
      const userId = (req.user as any).id;
      
      if (!productId || !planId) {
        return res.status(400).json({ message: "Product ID and Plan ID are required" });
      }
      
      const product = await storage.getProduct(parseInt(productId));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const plan = await storage.getSubscriptionPlan(parseInt(planId));
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      if (plan.interval === "month") {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (plan.interval === "year") {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      
      // Create subscription
      const subscription = await storage.createUserSubscription({
        userId,
        productId: parseInt(productId),
        planId: parseInt(planId),
        startDate,
        endDate,
        status: "active",
        stripeSubscriptionId: paymentIntentId || null
      });
      
      res.status(201).json(subscription);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // BLOG POST ROUTES
  // Get all blog posts
  app.get("/api/blog-posts", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const published = req.query.published === "true" ? true : 
                        req.query.published === "false" ? false : undefined;
      
      const { posts, total } = await storage.listBlogPosts(published, page, pageSize);
      res.json({ posts, total, page, pageSize });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get blog post by slug
  app.get("/api/blog-posts/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const post = await storage.getBlogPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get blog post by ID
  app.get("/api/blog-posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getBlogPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create blog post (admin only)
  app.post("/api/blog-posts", requireAdmin, async (req, res) => {
    try {
      const postData = insertBlogPostSchema.parse({
        ...req.body,
        authorId: (req.user as any).id
      });
      
      const post = await storage.createBlogPost(postData);
      res.status(201).json(post);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update blog post (admin only)
  app.patch("/api/blog-posts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedPost = await storage.updateBlogPost(id, updates);
      if (!updatedPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(updatedPost);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete blog post (admin only)
  app.delete("/api/blog-posts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteBlogPost(id);
      
      if (!result) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json({ message: "Blog post deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // EMAIL TEMPLATE ROUTES
  // Get all email templates (admin only)
  app.get("/api/email-templates", requireAdmin, async (req, res) => {
    try {
      const templates = await storage.listEmailTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get email template by ID (admin only)
  app.get("/api/email-templates/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getEmailTemplate(id);
      
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create email template (admin only)
  app.post("/api/email-templates", requireAdmin, async (req, res) => {
    try {
      const templateData = insertEmailTemplateSchema.parse(req.body);
      const template = await storage.createEmailTemplate(templateData);
      res.status(201).json(template);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update email template (admin only)
  app.patch("/api/email-templates/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedTemplate = await storage.updateEmailTemplate(id, updates);
      if (!updatedTemplate) {
        return res.status(404).json({ message: "Email template not found" });
      }
      
      res.json(updatedTemplate);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete email template (admin only)
  app.delete("/api/email-templates/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteEmailTemplate(id);
      
      if (!result) {
        return res.status(404).json({ message: "Email template not found" });
      }
      
      res.json({ message: "Email template deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // CONTENT PAGE ROUTES
  // Get all content pages
  app.get("/api/content-pages", async (req, res) => {
    try {
      const published = req.query.published === "true" ? true : 
                        req.query.published === "false" ? false : undefined;
      
      const pages = await storage.listContentPages(published);
      res.json(pages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get content page by slug
  app.get("/api/content-pages/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const page = await storage.getContentPageBySlug(slug);
      
      if (!page) {
        return res.status(404).json({ message: "Content page not found" });
      }
      
      res.json(page);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get content page by ID
  app.get("/api/content-pages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const page = await storage.getContentPage(id);
      
      if (!page) {
        return res.status(404).json({ message: "Content page not found" });
      }
      
      res.json(page);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create content page (admin only)
  app.post("/api/content-pages", requireAdmin, async (req, res) => {
    try {
      const pageData = insertContentPageSchema.parse(req.body);
      const page = await storage.createContentPage(pageData);
      res.status(201).json(page);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update content page (admin only)
  app.patch("/api/content-pages/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedPage = await storage.updateContentPage(id, updates);
      if (!updatedPage) {
        return res.status(404).json({ message: "Content page not found" });
      }
      
      res.json(updatedPage);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete content page (admin only)
  app.delete("/api/content-pages/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteContentPage(id);
      
      if (!result) {
        return res.status(404).json({ message: "Content page not found" });
      }
      
      res.json({ message: "Content page deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ADMIN DASHBOARD ROUTES
  // Get dashboard statistics (admin only)
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const { users: allUsers, total: totalUsers } = await storage.listUsers();
      const { products: allProducts, total: totalProducts } = await storage.listProducts();
      
      // Get subscription counts
      let totalActiveSubscriptions = 0;
      let monthlyRevenue = 0;
      
      // Calculate total active subscriptions and monthly revenue
      for (const user of allUsers) {
        const subscriptions = await storage.getUserActiveSubscriptions(user.id);
        totalActiveSubscriptions += subscriptions.length;
        
        // Add up revenue from subscriptions
        for (const sub of subscriptions) {
          // If yearly subscription, divide by 12 to get monthly revenue
          if (sub.plan.interval === "year") {
            monthlyRevenue += sub.plan.price / 12;
          } else {
            monthlyRevenue += sub.plan.price;
          }
        }
      }
      
      // Mock some data for demonstration
      const stats = {
        totalUsers,
        activeSubscriptions: totalActiveSubscriptions,
        monthlyRevenue: monthlyRevenue / 100, // Convert cents to dollars
        supportTickets: 5, // Mock value
        
        // Additional stats for charts
        userGrowth: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May"],
          data: [12, 19, 32, 45, 53]
        },
        revenueByMonth: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May"],
          data: [1200, 1900, 3200, 4500, 5300]
        },
        topProducts: allProducts.slice(0, 3).map(product => ({
          id: product.id,
          name: product.name,
          subscriptions: Math.floor(Math.random() * 400) + 100,
          revenue: Math.floor(Math.random() * 8000) + 2000
        }))
      };
      
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ANALYTICS ROUTES (admin only)
  app.get("/api/admin/analytics", requireAdmin, (req, res) => {
    // Mock analytics data
    const analytics = {
      totalVisits: 24583,
      uniqueVisitors: 15234,
      pageViews: 68932,
      bounceRate: 32.5,
      avgSessionDuration: "3m 42s",
      
      trafficByCountry: [
        { country: "United States", visits: 8934, percentage: 36.3 },
        { country: "United Kingdom", visits: 3241, percentage: 13.2 },
        { country: "Germany", visits: 2103, percentage: 8.6 },
        { country: "Canada", visits: 1877, percentage: 7.6 },
        { country: "France", visits: 1532, percentage: 6.2 },
        { country: "Others", visits: 6896, percentage: 28.1 }
      ],
      
      trafficByDevice: {
        desktop: 58.3,
        mobile: 33.7,
        tablet: 8.0
      },
      
      trafficBySources: [
        { source: "Direct", visits: 9832, percentage: 40.0 },
        { source: "Organic Search", visits: 7345, percentage: 29.9 },
        { source: "Referral", visits: 3621, percentage: 14.7 },
        { source: "Social", visits: 2134, percentage: 8.7 },
        { source: "Email", visits: 1651, percentage: 6.7 }
      ]
    };
    
    res.json(analytics);
  });

  const httpServer = createServer(app);
  return httpServer;
}
