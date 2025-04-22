import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import ProductList from '@/components/products/product-list';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowDown } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary to-secondary"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-dark rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-secondary rounded-full filter blur-3xl opacity-10"></div>
        
        <div className="max-w-[1150px] mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 leading-tight">
              Premium Software Subscriptions for <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Every Professional</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Discover powerful, secure software tools to enhance your productivity and streamline your workflow with flexible subscription options.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg">
                <a href="#products">
                  Browse Software
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#how-it-works">
                  How It Works
                </a>
              </Button>
            </div>
          </div>
          
          <div className="mt-16 flex justify-center">
            <div className="relative w-full max-w-5xl">
              <img 
                src="https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
                alt="Software dashboard preview" 
                className="rounded-xl shadow-2xl w-full"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-background to-transparent opacity-40"></div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background-elevated bg-opacity-70 backdrop-blur-sm px-4 py-2 rounded-full">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                  <span className="text-sm">3,000+ active subscribers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll Down Indicator */}
      <div className="flex justify-center -mt-6 mb-12">
        <a 
          href="#products" 
          className="bg-background-elevated rounded-full p-3 shadow-lg animate-bounce"
          aria-label="Scroll to products"
        >
          <ArrowDown className="h-5 w-5" />
        </a>
      </div>
      
      {/* Products Section */}
      <section id="products" className="bg-background py-16">
        <div className="max-w-[1150px] mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">Premium Software Solutions</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">Choose from our curated selection of professional software subscriptions</p>
          </div>
          
          <ProductList />
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="bg-background-elevated py-16">
        <div className="max-w-[1150px] mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">How It Works</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">Get started with Mechxer in just a few simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <i className="ri-user-add-line text-2xl"></i>
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">1. Create an Account</h3>
              <p className="text-muted-foreground">Sign up for a free Mechxer account to browse our premium software catalog.</p>
            </div>
            
            <div className="bg-background rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <i className="ri-shopping-bag-line text-2xl"></i>
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">2. Choose a Subscription</h3>
              <p className="text-muted-foreground">Select the software that meets your needs and pick a subscription plan.</p>
            </div>
            
            <div className="bg-background rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <i className="ri-download-line text-2xl"></i>
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">3. Download & Enjoy</h3>
              <p className="text-muted-foreground">Download your software immediately after payment and benefit from regular updates.</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link href="/register">Get Started Today</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="bg-background py-16">
        <div className="max-w-[1150px] mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">Why Choose Mechxer</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">We offer premium software with exceptional service</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-background-elevated rounded-xl p-6">
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-primary mb-4">
                <i className="ri-shield-check-line text-xl"></i>
              </div>
              <h3 className="text-lg font-display font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-muted-foreground">All software is thoroughly vetted for security and performance reliability.</p>
            </div>
            
            <div className="bg-background-elevated rounded-xl p-6">
              <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-full flex items-center justify-center text-secondary mb-4">
                <i className="ri-customer-service-line text-xl"></i>
              </div>
              <h3 className="text-lg font-display font-semibold mb-2">Premium Support</h3>
              <p className="text-muted-foreground">Get 24/7 customer support with all subscription plans.</p>
            </div>
            
            <div className="bg-background-elevated rounded-xl p-6">
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-primary mb-4">
                <i className="ri-refund-2-line text-xl"></i>
              </div>
              <h3 className="text-lg font-display font-semibold mb-2">14-Day Guarantee</h3>
              <p className="text-muted-foreground">Not satisfied? Get a full refund within 14 days of your purchase.</p>
            </div>
            
            <div className="bg-background-elevated rounded-xl p-6">
              <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-full flex items-center justify-center text-secondary mb-4">
                <i className="ri-rocket-line text-xl"></i>
              </div>
              <h3 className="text-lg font-display font-semibold mb-2">Regular Updates</h3>
              <p className="text-muted-foreground">Enjoy continuous improvements with regular software updates.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="bg-background-elevated py-16">
        <div className="max-w-[1150px] mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">What Our Customers Say</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">Don't just take our word for it</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="text-primary">
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">"Cloud Defender Pro has been a game-changer for our company's security infrastructure. The intuitive interface and comprehensive features make it easy to keep our data safe."</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary mr-3">
                  <i className="ri-user-fill"></i>
                </div>
                <div>
                  <div className="font-medium">Sarah Johnson</div>
                  <div className="text-xs text-muted-foreground">CTO, TechNova Inc.</div>
                </div>
              </div>
            </div>
            
            <div className="bg-background rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="text-primary">
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">"DataSync Pro has revolutionized how we handle data across our teams. The seamless synchronization and robust encryption give us peace of mind."</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary mr-3">
                  <i className="ri-user-fill"></i>
                </div>
                <div>
                  <div className="font-medium">Michael Chen</div>
                  <div className="text-xs text-muted-foreground">Data Engineer, GlobalSync</div>
                </div>
              </div>
            </div>
            
            <div className="bg-background rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="text-primary">
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-half-fill"></i>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">"The DevOps Toolkit has streamlined our deployment process significantly. Customer support is incredibly responsive whenever we have questions."</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary mr-3">
                  <i className="ri-user-fill"></i>
                </div>
                <div>
                  <div className="font-medium">Jessica Miller</div>
                  <div className="text-xs text-muted-foreground">DevOps Lead, WebSolutions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-background py-16">
        <div className="max-w-[1150px] mx-auto px-4">
          <div className="bg-primary bg-opacity-10 rounded-2xl p-6 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">Ready to Elevate Your Workflow?</h2>
            <p className="text-base text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of professionals who trust Mechxer for their software needs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
