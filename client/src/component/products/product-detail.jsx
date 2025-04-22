import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLocation, Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, 
  Database,
  Code, 
  Server, 
  Check, 
  Info, 
  ArrowRight,
  Monitor, 
  Apple,
  Terminal // Using Terminal instead of Linux which doesn't exist
} from 'lucide-react';

// Platform icon mapping
const platformIcons = {
  'Windows': <Monitor className="text-xl" />,
  'macOS': <Apple className="text-xl" />,
  'Linux': <Terminal className="text-xl" />,
  'Cloud': <Server className="text-xl" />,
  'iOS': <i className="ri-apple-fill text-xl"></i>,
  'Android': <i className="ri-android-fill text-xl"></i>
};

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-64 w-full rounded-lg mb-6" />
        <div className="space-y-2 mb-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-10 w-full mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="lg:col-span-1">
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-48 w-full rounded-lg mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default function ProductDetail({ product, plans }) {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Find the best value plan (annual is usually best value)
  const bestValuePlan = plans?.find(plan => plan.isPopular) || (plans && plans[0]);
  
  // Set best value plan as selected by default
  useState(() => {
    if (bestValuePlan && !selectedPlanId) {
      setSelectedPlanId(bestValuePlan.id);
    }
  }, [bestValuePlan, selectedPlanId]);

  const handleSubscribe = async () => {
    if (!selectedPlanId) {
      toast({
        title: "Please select a plan",
        description: "You need to select a subscription plan to continue.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create payment intent
      const paymentResponse = await apiRequest('POST', '/api/create-payment-intent', {
        planId: selectedPlanId
      });
      
      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment. Please try again.');
      }
      
      const { clientSecret } = await paymentResponse.json();
      
      // Redirect to checkout page with the client secret
      navigate(`/checkout?client_secret=${clientSecret}&plan=${selectedPlanId}&product=${product.id}`);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!product || !plans) {
    return <ProductDetailSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-6">{product.name}</h1>
        
        <div className="relative rounded-xl overflow-hidden mb-8">
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-auto rounded-xl"
            />
          ) : (
            <div className="w-full h-64 bg-background flex items-center justify-center rounded-xl">
              <div className="text-6xl text-primary">
                <Shield />
              </div>
            </div>
          )}
          <div className="absolute top-4 right-4 bg-background-elevated bg-opacity-70 backdrop-blur-sm px-3 py-1 rounded-full">
            <div className="flex items-center space-x-2">
              <Check className="text-secondary" />
              <span className="text-sm">Enterprise Security</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-display font-semibold">Product Description</h2>
          <p className="text-muted-foreground">
            {product.description}
          </p>
        </div>
        
        {/* Subscription Plans Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-display font-semibold mb-4">Subscription Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`border rounded-lg p-4 hover:border-primary transition-all ${
                  plan.isPopular ? 'border-primary relative' : 'border-border'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                    Best Value
                  </div>
                )}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-bold text-lg">{plan.name}</div>
                    <div className="text-xl font-bold text-primary">
                      {formatCurrency(plan.price)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    per {plan.interval}
                  </div>
                  
                  {/* Discount badge */}
                  {plan.interval === 'year' && (
                    <div className="bg-success bg-opacity-10 text-success text-sm px-2 py-1 rounded-md inline-block mb-2">
                      Save {Math.round((1 - (plan.price / 12 / (plans.find(p => p.interval === 'month')?.price || plan.price))) * 100)}% vs monthly
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 mb-4">
                  {plan.interval === 'month' ? (
                    <>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-success mr-2" />
                        <span className="text-sm">Monthly billing</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-success mr-2" />
                        <span className="text-sm">Cancel anytime</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-success mr-2" />
                        <span className="text-sm">Basic support</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-success mr-2" />
                        <span className="text-sm">Annual billing (save money)</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-success mr-2" />
                        <span className="text-sm">Priority support</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-success mr-2" />
                        <span className="text-sm">Extra features included</span>
                      </div>
                    </>
                  )}
                </div>
                
                <Button 
                  className="w-full" 
                  variant={selectedPlanId === plan.id ? "default" : "outline"}
                  onClick={() => {
                    setSelectedPlanId(plan.id);
                    setTimeout(() => handleSubscribe(), 100);
                  }}
                  disabled={isProcessing}
                >
                  {isProcessing && selectedPlanId === plan.id ? 'Processing...' : 'BUY NOW'}
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-display font-semibold mb-4">Supported Platforms</h2>
          <div className="flex flex-wrap gap-3">
            {product.platforms.map((platform, index) => (
              <div key={index} className="bg-background px-4 py-2 rounded-lg flex items-center space-x-2">
                {platformIcons[platform] || <Monitor className="text-xl" />}
                <span>{platform}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-display font-semibold mb-4">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-background p-4 rounded-lg">
              <div className="font-medium mb-1">System Requirements</div>
              <div className="text-muted-foreground text-sm">8GB RAM, 2GHz Dual Core, 200MB free space</div>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <div className="font-medium mb-1">Installation Type</div>
              <div className="text-muted-foreground text-sm">Client + Cloud Service</div>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <div className="font-medium mb-1">Updates</div>
              <div className="text-muted-foreground text-sm">Automatic, bi-weekly</div>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <div className="font-medium mb-1">Support</div>
              <div className="text-muted-foreground text-sm">24/7 with enterprise plan</div>
            </div>
          </div>
        </div>
        
        {product.zipPassword && (
          <div>
            <h2 className="text-2xl font-display font-semibold mb-4">ZIP Information</h2>
            <div className="bg-background p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="text-primary text-xl mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    After subscription, you'll receive a download link to a password-protected ZIP file. The password 
                    will be provided in your account dashboard and purchase confirmation email.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="lg:col-span-1">
        <div className="bg-background-card rounded-xl p-6 sticky top-24">
          <h2 className="text-xl font-display font-semibold mb-4">Why Choose {product.name}?</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-full text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Enterprise-Grade Security</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced protection against the latest threats, constantly updated to keep you secure.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-full text-primary">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Regular Updates</h3>
                <p className="text-sm text-muted-foreground">
                  Stay protected with automatic updates that deploy seamlessly in the background.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-full text-primary">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Cross-Platform Support</h3>
                <p className="text-sm text-muted-foreground">
                  Works on all your devices, offering consistent protection across your ecosystem.
                </p>
              </div>
            </div>
          </div>
          
          {/* Customer reviews/testimonials section */}
          <div className="border-t border-border pt-6 mt-6">
            <h3 className="font-medium mb-4">What Our Customers Say</h3>
            
            <div className="bg-background rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <div className="text-yellow-500 flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm font-medium">Sarah T. - Enterprise User</span>
              </div>
              <p className="text-sm text-muted-foreground">
                "Incredible product that has saved our company multiple times from potential threats. The enterprise plan is worth every penny."
              </p>
            </div>
            
            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="text-yellow-500 flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm font-medium">Michael R. - Developer</span>
              </div>
              <p className="text-sm text-muted-foreground">
                "Easy to setup and the cross-platform capabilities are fantastic. Worth the annual subscription for the peace of mind."
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Secure Payment</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <i className="ri-refund-2-line"></i>
              <span className="text-sm">14-Day Refund</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
