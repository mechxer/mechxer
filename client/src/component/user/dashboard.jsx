import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { CalendarCheck, ShoppingBag, HelpCircle, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import SubscriptionCard from '@/components/user/subscription-card';

export function DashboardSkeleton() {
  return (
    <>
      {/* Dashboard Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-background-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="w-12 h-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Subscriptions Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-4" />
        {[1, 2].map((i) => (
          <div key={i} className="mb-4">
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ))}
      </div>

      {/* Recent Activity Skeleton */}
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </>
  );
}

export default function UserDashboard({ user }) {
  // Fetch user subscriptions
  const { 
    data: subscriptions, 
    isLoading: isLoadingSubscriptions 
  } = useQuery({
    queryKey: ['/api/users/subscriptions'],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="text-muted-foreground mb-6">Please log in to access your dashboard</p>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  if (isLoadingSubscriptions) {
    return <DashboardSkeleton />;
  }

  // Find next payment date - the closest upcoming subscription renewal
  const nextPaymentDate = subscriptions?.length > 0 
    ? subscriptions.reduce((closest, sub) => {
        const endDate = new Date(sub.endDate);
        if (!closest || endDate < closest) return endDate;
        return closest;
      }, null)
    : null;
  
  return (
    <>
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-background-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-muted-foreground text-sm mb-1">Active Subscriptions</div>
                <div className="text-2xl font-semibold">{subscriptions?.length || 0}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-muted-foreground text-sm mb-1">Next Payment</div>
                <div className="text-2xl font-semibold">
                  {nextPaymentDate ? formatDate(nextPaymentDate, 'short') : 'No active subscriptions'}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning bg-opacity-10 flex items-center justify-center text-warning">
                <CalendarCheck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-muted-foreground text-sm mb-1">Support</div>
                <div className="text-2xl font-semibold">
                  <Link href="/user/support" className="text-primary hover:underline">
                    Get Help
                  </Link>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary bg-opacity-10 flex items-center justify-center text-secondary">
                <HelpCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Active Subscriptions */}
      <div className="mb-8">
        <h3 className="text-xl font-display font-semibold mb-4">Active Subscriptions</h3>
        
        {subscriptions?.length > 0 ? (
          <div className="space-y-4">
            {subscriptions.map(subscription => (
              <SubscriptionCard 
                key={subscription.id} 
                subscription={subscription} 
              />
            ))}
          </div>
        ) : (
          <Card className="bg-background-elevated border border-border p-6">
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Active Subscriptions</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any active subscriptions at the moment.
              </p>
              <Button asChild>
                <Link href="/">Browse Products</Link>
              </Button>
            </div>
          </Card>
        )}
      </div>
      
      {/* Quick Actions */}
      {subscriptions?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-display font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-background hover:bg-background-elevated transition-colors">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary mb-3">
                  <Download className="h-5 w-5" />
                </div>
                <h4 className="font-medium mb-1">Downloads</h4>
                <p className="text-muted-foreground text-sm mb-3">Access your software downloads</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/user/downloads">View Downloads</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-background hover:bg-background-elevated transition-colors">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary mb-3">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <h4 className="font-medium mb-1">Subscriptions</h4>
                <p className="text-muted-foreground text-sm mb-3">Manage your subscriptions</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/user/subscriptions">Manage</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-background hover:bg-background-elevated transition-colors">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary mb-3">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <h4 className="font-medium mb-1">Support</h4>
                <p className="text-muted-foreground text-sm mb-3">Get help with your products</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/user/support">Contact Support</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-background hover:bg-background-elevated transition-colors">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary mb-3">
                  <i className="ri-store-line h-5 w-5"></i>
                </div>
                <h4 className="font-medium mb-1">Browse Products</h4>
                <p className="text-muted-foreground text-sm mb-3">Discover more software</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/">Explore</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {/* Recent Activity */}
      <div>
        <h3 className="text-xl font-display font-semibold mb-4">Recent Activity</h3>
        
        <Card className="bg-background-elevated overflow-hidden">
          {subscriptions?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {subscriptions.map((subscription, index) => (
                    <tr key={subscription.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(subscription.startDate, 'short')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        New Subscription
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {subscription.product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="bg-success bg-opacity-10 text-success px-2 py-1 rounded-full text-xs">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">No recent activity to display.</p>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
