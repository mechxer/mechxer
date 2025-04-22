import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  subscriptionPlans, type SubscriptionPlan, type InsertSubscriptionPlan,
  userSubscriptions, type UserSubscription, type InsertUserSubscription,
  blogPosts, type BlogPost, type InsertBlogPost,
  emailTemplates, type EmailTemplate, type InsertEmailTemplate,
  contentPages, type ContentPage, type InsertContentPage,
  cryptoTransactions, type CryptoTransaction, type InsertCryptoTransaction
} from "@shared/schema";

// Modify the interface with any CRUD methods you need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  listUsers(page?: number, pageSize?: number): Promise<{ users: User[], total: number }>;
  updateWalletAddress(userId: number, walletAddress: string): Promise<User>;

  // Product methods
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  listProducts(active?: boolean, page?: number, pageSize?: number): Promise<{ products: Product[], total: number }>;
  getProductWithPlans(id: number): Promise<{ product: Product, plans: SubscriptionPlan[] } | undefined>;

  // Subscription plan methods
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: number): Promise<boolean>;
  getSubscriptionPlansByProduct(productId: number): Promise<SubscriptionPlan[]>;

  // Crypto transaction methods
  createCryptoTransaction(transaction: InsertCryptoTransaction): Promise<CryptoTransaction>;
  getCryptoTransaction(id: number): Promise<CryptoTransaction | undefined>;
  getTransactionByTxHash(txHash: string): Promise<CryptoTransaction | undefined>;
  updateTransactionStatus(id: number, status: string, confirmedAt?: Date): Promise<CryptoTransaction>;
  getUserTransactions(userId: number): Promise<CryptoTransaction[]>;

  // User subscription methods
  getUserSubscription(id: number): Promise<UserSubscription | undefined>;
  createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(id: number, updates: Partial<UserSubscription>): Promise<UserSubscription | undefined>;
  getUserSubscriptions(userId: number): Promise<UserSubscription[]>;
  getUserActiveSubscriptions(userId: number): Promise<(UserSubscription & { product: Product, plan: SubscriptionPlan })[]>;

  // Blog post methods
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  listBlogPosts(published?: boolean, page?: number, pageSize?: number): Promise<{ posts: BlogPost[], total: number }>;

  // Email template methods
  getEmailTemplate(id: number): Promise<EmailTemplate | undefined>;
  getEmailTemplateByName(name: string): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, updates: Partial<EmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: number): Promise<boolean>;
  listEmailTemplates(): Promise<EmailTemplate[]>;

  // Content page methods
  getContentPage(id: number): Promise<ContentPage | undefined>;
  getContentPageBySlug(slug: string): Promise<ContentPage | undefined>;
  createContentPage(page: InsertContentPage): Promise<ContentPage>;
  updateContentPage(id: number, updates: Partial<ContentPage>): Promise<ContentPage | undefined>;
  deleteContentPage(id: number): Promise<boolean>;
  listContentPages(published?: boolean): Promise<ContentPage[]>;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private productsData: Map<number, Product>;
  private subscriptionPlansData: Map<number, SubscriptionPlan>;
  private userSubscriptionsData: Map<number, UserSubscription>;
  private blogPostsData: Map<number, BlogPost>;
  private emailTemplatesData: Map<number, EmailTemplate>;
  private contentPagesData: Map<number, ContentPage>;
  private cryptoTransactionsData: Map<number, CryptoTransaction>;
  
  // ID counters
  private userIdCounter: number;
  private productIdCounter: number;
  private subscriptionPlanIdCounter: number;
  private userSubscriptionIdCounter: number;
  private blogPostIdCounter: number;
  private emailTemplateIdCounter: number;
  private contentPageIdCounter: number;
  private cryptoTransactionIdCounter: number;

  constructor() {
    this.usersData = new Map();
    this.productsData = new Map();
    this.subscriptionPlansData = new Map();
    this.userSubscriptionsData = new Map();
    this.blogPostsData = new Map();
    this.emailTemplatesData = new Map();
    this.contentPagesData = new Map();
    this.cryptoTransactionsData = new Map();
    
    this.userIdCounter = 1;
    this.productIdCounter = 1;
    this.subscriptionPlanIdCounter = 1;
    this.userSubscriptionIdCounter = 1;
    this.blogPostIdCounter = 1;
    this.emailTemplateIdCounter = 1;
    this.contentPageIdCounter = 1;
    this.cryptoTransactionIdCounter = 1;
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create admin user
    this.createUser({
      username: "admin",
      email: "admin@mechxer.com",
      password: "$2b$10$XqKRXr3vXWb.WhaLJOrW1.h9JMVcx8gIhzRJ5K1gYdmtxVmP.HH9i", // "admin123"
      fullName: "Admin User",
      role: "admin",
      isVerified: true
    });

    // Create demo user
    this.createUser({
      username: "demo",
      email: "demo@example.com",
      password: "$2b$10$PiLuEXQxRSg5KGHnMZP6AekFqyAPhe3GKH8lMuXUUY35GKt9RWlEC", // "demo123"
      fullName: "Demo User",
      role: "user",
      isVerified: true
    });

    // Create demo products
    const cloudDefenderProduct = this.createProduct({
      name: "Cloud Defender Pro",
      shortDescription: "Enterprise-grade security solution with advanced threat detection",
      description: "Cloud Defender Pro is an enterprise-grade security solution that provides advanced threat detection, network monitoring, and data loss prevention capabilities for businesses of all sizes.",
      images: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71"],
      platforms: ["Windows", "macOS", "Linux"],
      firebaseConfig: { apiKey: "sample", projectId: "sample" },
      downloadLink: "https://download.example.com/cloud-defender",
      zipPassword: "securepass123",
      isActive: true
    });

    const dataSyncProduct = this.createProduct({
      name: "DataSync Pro",
      shortDescription: "Seamless data synchronization and backup solution for teams",
      description: "DataSync Pro provides seamless data synchronization and backup solutions for teams with end-to-end encryption and version history for complete data protection.",
      images: ["https://images.unsplash.com/photo-1558655146-d09347e92766"],
      platforms: ["Windows", "macOS", "iOS", "Android"],
      firebaseConfig: { apiKey: "sample", projectId: "sample" },
      downloadLink: "https://download.example.com/datasync",
      zipPassword: "datasync456",
      isActive: true
    });

    const devOpsProduct = this.createProduct({
      name: "DevOps Toolkit",
      shortDescription: "Comprehensive suite for CI/CD and application monitoring",
      description: "A comprehensive suite of development and operations tools for continuous integration, deployment, and monitoring of applications.",
      images: ["https://images.unsplash.com/photo-1541462608143-67571c6738dd"],
      platforms: ["Windows", "macOS", "Linux"],
      firebaseConfig: { apiKey: "sample", projectId: "sample" },
      downloadLink: "https://download.example.com/devops",
      zipPassword: "devops789",
      isActive: true
    });

    // Create subscription plans
    this.createSubscriptionPlan({
      productId: cloudDefenderProduct.id,
      name: "Monthly",
      price: 1999, // $19.99
      priceCrypto: 10, // 0.01 ETH
      cryptoCurrency: "ETH",
      interval: "month",
      features: ["Basic security features", "Email support", "5 devices"],
      isPopular: false
    });

    this.createSubscriptionPlan({
      productId: cloudDefenderProduct.id,
      name: "Annual",
      price: 17988, // $179.88 ($14.99/month)
      priceCrypto: 100, // 0.1 ETH
      cryptoCurrency: "ETH",
      interval: "year",
      features: ["All security features", "Priority support", "10 devices"],
      isPopular: true
    });

    this.createSubscriptionPlan({
      productId: dataSyncProduct.id,
      name: "Monthly",
      price: 1499, // $14.99
      priceCrypto: 8, // 0.008 ETH
      cryptoCurrency: "ETH",
      interval: "month",
      features: ["10GB storage", "Basic sync", "3 devices"],
      isPopular: false
    });

    this.createSubscriptionPlan({
      productId: dataSyncProduct.id,
      name: "Annual",
      price: 13188, // $131.88 ($10.99/month)
      priceCrypto: 75, // 0.075 ETH
      cryptoCurrency: "ETH",
      interval: "year",
      features: ["50GB storage", "Advanced sync", "Unlimited devices"],
      isPopular: true
    });

    this.createSubscriptionPlan({
      productId: devOpsProduct.id,
      name: "Monthly",
      price: 2999, // $29.99
      priceCrypto: 15, // 0.015 ETH
      cryptoCurrency: "ETH",
      interval: "month",
      features: ["5 repositories", "CI/CD pipeline", "Basic monitoring"],
      isPopular: false
    });

    this.createSubscriptionPlan({
      productId: devOpsProduct.id,
      name: "Annual",
      price: 28788, // $287.88 ($23.99/month)
      priceCrypto: 150, // 0.15 ETH
      cryptoCurrency: "ETH",
      interval: "year",
      features: ["Unlimited repositories", "Advanced CI/CD", "Full monitoring suite"],
      isPopular: true
    });

    // Create sample blog posts
    this.createBlogPost({
      title: "Top 5 DevOps Trends in 2023",
      slug: "top-5-devops-trends-2023",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      excerpt: "Discover the most important DevOps trends that will shape the industry in 2023.",
      featuredImage: "https://images.unsplash.com/photo-1555099962-4199c345e5dd",
      authorId: 1,
      isPublished: true,
      publishedAt: new Date()
    });

    this.createBlogPost({
      title: "How to Secure Your Cloud Infrastructure",
      slug: "secure-cloud-infrastructure",
      content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      excerpt: "Learn the best practices to keep your cloud infrastructure secure from modern threats.",
      featuredImage: "https://images.unsplash.com/photo-1597733336794-12d05021d510",
      authorId: 1,
      isPublished: true,
      publishedAt: new Date()
    });

    // Create email templates
    this.createEmailTemplate({
      name: "welcome",
      subject: "Welcome to Mechxer!",
      content: "Hello {{username}},\n\nWelcome to Mechxer! We're excited to have you on board.",
    });

    this.createEmailTemplate({
      name: "subscription_confirmation",
      subject: "Your Subscription Confirmation",
      content: "Hello {{username}},\n\nThank you for subscribing to {{productName}}. Your subscription is now active.",
    });

    this.createEmailTemplate({
      name: "subscription_expiry",
      subject: "Your Subscription is About to Expire",
      content: "Hello {{username}},\n\nYour subscription to {{productName}} will expire on {{expiryDate}}.",
    });

    // Create content pages
    this.createContentPage({
      title: "About Us",
      slug: "about",
      content: "<h1>About Mechxer</h1><p>Mechxer is a premium software subscription marketplace offering high-quality software solutions for professionals and businesses.</p>",
      isPublished: true
    });

    this.createContentPage({
      title: "Privacy Policy",
      slug: "privacy",
      content: "<h1>Privacy Policy</h1><p>At Mechxer, we take your privacy seriously...</p>",
      isPublished: true
    });

    this.createContentPage({
      title: "Terms & Conditions",
      slug: "terms",
      content: "<h1>Terms & Conditions</h1><p>By using Mechxer, you agree to the following terms...</p>",
      isPublished: true
    });

    this.createContentPage({
      title: "DMCA",
      slug: "dmca",
      content: "<h1>DMCA Policy</h1><p>Mechxer respects the intellectual property rights of others...</p>",
      isPublished: true
    });

    this.createContentPage({
      title: "Contact Us",
      slug: "contact",
      content: "<h1>Contact Us</h1><p>Have questions? We're here to help...</p>",
      isPublished: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      walletAddress: null,
      profileImage: null,
      createdAt: new Date()
    };
    this.usersData.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.usersData.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.usersData.delete(id);
  }

  async listUsers(page: number = 1, pageSize: number = 10): Promise<{ users: User[], total: number }> {
    const users = Array.from(this.usersData.values());
    const total = users.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      users: users.slice(start, end),
      total
    };
  }

  async updateWalletAddress(userId: number, walletAddress: string): Promise<User> {
    const user = this.usersData.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, walletAddress };
    this.usersData.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Crypto transaction methods
  
  async createCryptoTransaction(transaction: InsertCryptoTransaction): Promise<CryptoTransaction> {
    const id = this.cryptoTransactionIdCounter++;
    const now = new Date();
    
    const newTransaction: CryptoTransaction = {
      ...transaction,
      id,
      createdAt: now,
      status: transaction.status || "pending",
      confirmedAt: null
    };
    
    this.cryptoTransactionsData.set(id, newTransaction);
    return newTransaction;
  }
  
  async getCryptoTransaction(id: number): Promise<CryptoTransaction | undefined> {
    return this.cryptoTransactionsData.get(id);
  }
  
  async getTransactionByTxHash(txHash: string): Promise<CryptoTransaction | undefined> {
    return Array.from(this.cryptoTransactionsData.values()).find(
      tx => tx.txHash === txHash
    );
  }
  
  async updateTransactionStatus(id: number, status: string, confirmedAt?: Date): Promise<CryptoTransaction> {
    const transaction = this.cryptoTransactionsData.get(id);
    if (!transaction) throw new Error("Transaction not found");
    
    const updatedTransaction = {
      ...transaction,
      status,
      confirmedAt: confirmedAt || transaction.confirmedAt
    };
    
    this.cryptoTransactionsData.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  async getUserTransactions(userId: number): Promise<CryptoTransaction[]> {
    return Array.from(this.cryptoTransactionsData.values())
      .filter(tx => tx.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.productsData.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const now = new Date();
    const newProduct: Product = { 
      ...product, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.productsData.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.productsData.get(id);
    if (!product) return undefined;

    const updatedProduct = { 
      ...product, 
      ...updates,
      updatedAt: new Date()
    };
    this.productsData.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.productsData.delete(id);
  }

  async listProducts(active?: boolean, page: number = 1, pageSize: number = 10): Promise<{ products: Product[], total: number }> {
    let products = Array.from(this.productsData.values());
    
    if (active !== undefined) {
      products = products.filter(product => product.isActive === active);
    }
    
    const total = products.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      products: products.slice(start, end),
      total
    };
  }

  async getProductWithPlans(id: number): Promise<{ product: Product, plans: SubscriptionPlan[] } | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;
    
    const plans = await this.getSubscriptionPlansByProduct(id);
    return { product, plans };
  }

  // Subscription plan methods
  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlansData.get(id);
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = this.subscriptionPlanIdCounter++;
    const newPlan: SubscriptionPlan = { 
      ...plan, 
      id,
      createdAt: new Date()
    };
    this.subscriptionPlansData.set(id, newPlan);
    return newPlan;
  }

  async updateSubscriptionPlan(id: number, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const plan = this.subscriptionPlansData.get(id);
    if (!plan) return undefined;

    const updatedPlan = { ...plan, ...updates };
    this.subscriptionPlansData.set(id, updatedPlan);
    return updatedPlan;
  }

  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    return this.subscriptionPlansData.delete(id);
  }

  async getSubscriptionPlansByProduct(productId: number): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlansData.values())
      .filter(plan => plan.productId === productId);
  }

  // User subscription methods
  async getUserSubscription(id: number): Promise<UserSubscription | undefined> {
    return this.userSubscriptionsData.get(id);
  }

  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const id = this.userSubscriptionIdCounter++;
    const newSubscription: UserSubscription = { 
      ...subscription, 
      id,
      createdAt: new Date()
    };
    this.userSubscriptionsData.set(id, newSubscription);
    return newSubscription;
  }

  async updateUserSubscription(id: number, updates: Partial<UserSubscription>): Promise<UserSubscription | undefined> {
    const subscription = this.userSubscriptionsData.get(id);
    if (!subscription) return undefined;

    const updatedSubscription = { ...subscription, ...updates };
    this.userSubscriptionsData.set(id, updatedSubscription);
    return updatedSubscription;
  }

  async getUserSubscriptions(userId: number): Promise<UserSubscription[]> {
    return Array.from(this.userSubscriptionsData.values())
      .filter(sub => sub.userId === userId);
  }

  async getUserActiveSubscriptions(userId: number): Promise<(UserSubscription & { product: Product, plan: SubscriptionPlan })[]> {
    const subscriptions = Array.from(this.userSubscriptionsData.values())
      .filter(sub => sub.userId === userId && sub.status === "active");
    
    const result = [];
    for (const sub of subscriptions) {
      const product = this.productsData.get(sub.productId);
      const plan = this.subscriptionPlansData.get(sub.planId);
      
      if (product && plan) {
        result.push({
          ...sub,
          product,
          plan
        });
      }
    }
    
    return result;
  }

  // Blog post methods
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPostsData.get(id);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPostsData.values())
      .find(post => post.slug === slug);
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostIdCounter++;
    const now = new Date();
    const newPost: BlogPost = { 
      ...post, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.blogPostsData.set(id, newPost);
    return newPost;
  }

  async updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const post = this.blogPostsData.get(id);
    if (!post) return undefined;

    const updatedPost = { 
      ...post, 
      ...updates,
      updatedAt: new Date()
    };
    this.blogPostsData.set(id, updatedPost);
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    return this.blogPostsData.delete(id);
  }

  async listBlogPosts(published?: boolean, page: number = 1, pageSize: number = 10): Promise<{ posts: BlogPost[], total: number }> {
    let posts = Array.from(this.blogPostsData.values());
    
    if (published !== undefined) {
      posts = posts.filter(post => post.isPublished === published);
    }
    
    // Sort by published date or created date, most recent first
    posts.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return dateB.getTime() - dateA.getTime();
    });
    
    const total = posts.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      posts: posts.slice(start, end),
      total
    };
  }

  // Email template methods
  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    return this.emailTemplatesData.get(id);
  }

  async getEmailTemplateByName(name: string): Promise<EmailTemplate | undefined> {
    return Array.from(this.emailTemplatesData.values())
      .find(template => template.name === name);
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const id = this.emailTemplateIdCounter++;
    const now = new Date();
    const newTemplate: EmailTemplate = { 
      ...template, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.emailTemplatesData.set(id, newTemplate);
    return newTemplate;
  }

  async updateEmailTemplate(id: number, updates: Partial<EmailTemplate>): Promise<EmailTemplate | undefined> {
    const template = this.emailTemplatesData.get(id);
    if (!template) return undefined;

    const updatedTemplate = { 
      ...template, 
      ...updates,
      updatedAt: new Date()
    };
    this.emailTemplatesData.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    return this.emailTemplatesData.delete(id);
  }

  async listEmailTemplates(): Promise<EmailTemplate[]> {
    return Array.from(this.emailTemplatesData.values());
  }

  // Content page methods
  async getContentPage(id: number): Promise<ContentPage | undefined> {
    return this.contentPagesData.get(id);
  }

  async getContentPageBySlug(slug: string): Promise<ContentPage | undefined> {
    return Array.from(this.contentPagesData.values())
      .find(page => page.slug === slug);
  }

  async createContentPage(page: InsertContentPage): Promise<ContentPage> {
    const id = this.contentPageIdCounter++;
    const now = new Date();
    const newPage: ContentPage = { 
      ...page, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.contentPagesData.set(id, newPage);
    return newPage;
  }

  async updateContentPage(id: number, updates: Partial<ContentPage>): Promise<ContentPage | undefined> {
    const page = this.contentPagesData.get(id);
    if (!page) return undefined;

    const updatedPage = { 
      ...page, 
      ...updates,
      updatedAt: new Date()
    };
    this.contentPagesData.set(id, updatedPage);
    return updatedPage;
  }

  async deleteContentPage(id: number): Promise<boolean> {
    return this.contentPagesData.delete(id);
  }

  async listContentPages(published?: boolean): Promise<ContentPage[]> {
    let pages = Array.from(this.contentPagesData.values());
    
    if (published !== undefined) {
      pages = pages.filter(page => page.isPublished === published);
    }
    
    return pages;
  }
}

export const storage = new MemStorage();
