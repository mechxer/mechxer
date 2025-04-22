import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserSidebar } from '@/components/layout/sidebar';
import { formatCurrency } from '@/lib/utils';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  Package,
  DownloadCloud,
  ArrowUpRight
} from 'lucide-react';

export default function UserSubscriptionsPage() {
  const [location, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch current user
  const { 
    data: user,
    isLoading: isUserLoading,
    error
  } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false
  });
  
  // Fetch user subscriptions
  const { 
    data: subscriptions,
    isLoading: isSubscriptionsLoading
  } = useQuery({
    queryKey: ['/api/subscriptions'],
    enabled: !!user,
  });
  
  useEffect(() => {
    if (error) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    
    // Only show loading state for the initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [error, navigate]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Calculate days remaining in subscription
  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };
  
  // Get badge for subscription status
  const getStatusBadge = (status, endDate) => {
    if (status === 'active') {
      const daysRemaining = getDaysRemaining(endDate);
      
      if (daysRemaining <= 7) {
        return (
          <Badge variant="warning" className="ml-2">
            Expires soon
          </Badge>
        );
      }
      
      return (
        <Badge variant="success" className="ml-2">
          Active
        </Badge>
      );
    }
    
    if (status === 'pending') {
      return (
        <Badge variant="outline" className="ml-2">
          Pending
        </Badge>
      );
    }
    
    if (status === 'expired') {
      return (
        <Badge variant="destructive" className="ml-2">
          Expired
        </Badge>
      );
    }
    
    return null;
  };

  // Mock subscriptions if none available from the API
  const mockSubscriptions = [
    {
      id: 1,
      product: {
        id: 1,
        name: "Cloud Defender Pro",
        description: "Enterprise-grade security solution with advanced threat detection",
        shortDescription: "Enterprise-grade security solution with advanced threat detection",
        images: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71"],
        downloadLink: "https://download.example.com/cloud-defender"
      },
      plan: {
        id: 2,
        name: "Annual",
        price: 17988,
        priceCrypto: 100,
        cryptoCurrency: "ETH",
        interval: "year",
        features: ["All security features", "Priority support", "10 devices"]
      },
      status: "active",
      startDate: "2023-07-10",
      endDate: "2024-07-10",
      transaction: {
        txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
        amount: "0.15",
        currency: "ETH"
      }
    },
    {
      id: 2,
      product: {
        id: 2,
        name: "DataSync Pro",
        description: "Seamless data synchronization and backup solutions for teams with end-to-end encryption",
        shortDescription: "Seamless data synchronization and backup solution for teams",
        images: ["https://images.unsplash.com/photo-1558655146-d09347e92766"],
        downloadLink: "https://download.example.com/datasync"
      },
      plan: {
        id: 3,
        name: "Monthly",
        price: 1499,
        priceCrypto: 8,
        cryptoCurrency: "ETH",
        interval: "month",
        features: ["10GB storage", "Basic sync", "3 devices"]
      },
      status: "active",
      startDate: "2023-08-05",
      endDate: "2023-09-05",
      transaction: {
        txHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
        amount: "0.008",
        currency: "ETH"
      }
    }
  ];
  
  const subscriptionsData = subscriptions || mockSubscriptions;
  
  // Combine our controlled loading state with the query loading states
  const loading = isLoading || isUserLoading;

  return (
    <div className="bg-background pb-16">
      <Helmet>
        <title>Your Subscriptions - Mechxer</title>
        <meta name="description" content="Manage your software subscriptions on Mechxer" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Your Subscriptions</h1>
          <p className="text-muted-foreground">
            View and manage your active software subscriptions
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <UserSidebar user={user} />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-4 space-y-8">
            {loading ? (
              <div className="space-y-6">
                <div className="bg-muted h-40 rounded-xl animate-pulse"></div>
                <div className="bg-muted h-40 rounded-xl animate-pulse"></div>
              </div>
            ) : isSubscriptionsLoading ? (
              <div className="space-y-6">
                <div className="bg-muted h-40 rounded-xl animate-pulse"></div>
                <div className="bg-muted h-40 rounded-xl animate-pulse"></div>
              </div>
            ) : subscriptionsData.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Subscriptions Found</CardTitle>
                  <CardDescription>
                    You don't have any active subscriptions yet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-center mb-6 max-w-md">
                    Browse our products and subscribe to premium software to enhance your workflow.
                  </p>
                  <Button asChild>
                    <Link href="/">
                      Browse Products
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-6">
                  {subscriptionsData.map((subscription) => (
                    <Card key={subscription.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div>
                            <CardTitle className="flex items-center">
                              {subscription.product.name}
                              {getStatusBadge(subscription.status, subscription.endDate)}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {subscription.product.shortDescription}
                            </CardDescription>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {subscription.product.downloadLink && (
                              <Button size="sm" variant="outline" asChild>
                                <a 
                                  href={subscription.product.downloadLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <DownloadCloud className="mr-2 h-4 w-4" />
                                  Download
                                </a>
                              </Button>
                            )}
                            
                            <Button size="sm" asChild>
                              <Link href={`/product/${subscription.product.id}`}>
                                <Package className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Subscription details */}
                          <div className="space-y-3 flex-1">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-sm font-medium">Plan</div>
                                <div className="text-sm">{subscription.plan.name}</div>
                              </div>
                              
                              <div>
                                <div className="text-sm font-medium">Price</div>
                                <div className="text-sm">
                                  {subscription.plan.priceCrypto} {subscription.plan.cryptoCurrency}
                                  <span className="text-xs text-muted-foreground ml-1">
                                    ({formatCurrency(subscription.plan.price / 100)})
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                <div className="text-sm font-medium">Start Date</div>
                              </div>
                              <div className="text-sm">
                                {formatDate(subscription.startDate)}
                              </div>
                              
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                <div className="text-sm font-medium">End Date</div>
                              </div>
                              <div className="text-sm">
                                {formatDate(subscription.endDate)}
                                {subscription.status === 'active' && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({getDaysRemaining(subscription.endDate)} days left)
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Transaction info */}
                            {subscription.transaction && (
                              <div className="pt-3 mt-3 border-t border-border">
                                <div className="text-sm font-medium mb-1">Transaction</div>
                                <div className="text-xs font-mono truncate">
                                  <a 
                                    href={`https://etherscan.io/tx/${subscription.transaction.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center"
                                  >
                                    {subscription.transaction.txHash}
                                    <ArrowUpRight className="h-3 w-3 ml-1" />
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Features list */}
                          <div className="flex-1">
                            <div className="text-sm font-medium mb-2">Included Features</div>
                            <ul className="space-y-1 text-sm">
                              {subscription.plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="bg-muted/30 border-t border-border flex flex-wrap gap-3 justify-end">
                        {subscription.status === 'active' && (
                          <>
                            <Button size="sm" variant="outline">
                              Contact Support
                            </Button>
                            <Button size="sm">
                              Renew Subscription
                            </Button>
                          </>
                        )}
                        
                        {subscription.status === 'expired' && (
                          <Button size="sm">
                            Reactivate
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Need More Software?</CardTitle>
                    <CardDescription>
                      Explore our catalog to find more premium software tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <Link href="/">
                        Browse Products
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}