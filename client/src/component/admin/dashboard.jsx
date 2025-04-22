import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  HelpCircle, 
  ArrowUp, 
  ArrowDown, 
  Activity
} from 'lucide-react';
import AdminAnalytics from './analytics';

export function DashboardSkeleton() {
  return (
    <>
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-background">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="w-12 h-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <Card className="bg-background rounded-xl mb-8">
        <CardHeader>
          <Skeleton className="h-6 w-36 mb-1" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>

      {/* Secondary cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </>
  );
}

export default function AdminDashboard({ user }) {
  // Fetch admin stats
  const { 
    data: stats, 
    isLoading: isLoadingStats 
  } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: !!user && user.role === 'admin',
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
        <p className="text-muted-foreground mb-6">You don't have permission to access this page</p>
        <Link href="/" className="text-primary hover:underline">
          Return to Homepage
        </Link>
      </div>
    );
  }

  if (isLoadingStats) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-background">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-muted-foreground text-sm mb-1">Total Users</div>
                <div className="text-2xl font-semibold">{stats?.totalUsers || 0}</div>
                <div className="text-success text-xs flex items-center mt-1">
                  <ArrowUp className="mr-1 h-3 w-3" /> 12% this month
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-muted-foreground text-sm mb-1">Active Subscriptions</div>
                <div className="text-2xl font-semibold">{stats?.activeSubscriptions || 0}</div>
                <div className="text-success text-xs flex items-center mt-1">
                  <ArrowUp className="mr-1 h-3 w-3" /> 8% this month
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary bg-opacity-10 flex items-center justify-center text-secondary">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-muted-foreground text-sm mb-1">Monthly Revenue</div>
                <div className="text-2xl font-semibold">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
                <div className="text-success text-xs flex items-center mt-1">
                  <ArrowUp className="mr-1 h-3 w-3" /> 15% this month
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning bg-opacity-10 flex items-center justify-center text-warning">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-muted-foreground text-sm mb-1">Support Tickets</div>
                <div className="text-2xl font-semibold">{stats?.supportTickets || 0}</div>
                <div className="text-destructive text-xs flex items-center mt-1">
                  <ArrowUp className="mr-1 h-3 w-3" /> 5% this month
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-destructive bg-opacity-10 flex items-center justify-center text-destructive">
                <HelpCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Revenue Chart */}
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Monthly revenue for the current year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {stats?.revenueByMonth ? (
                  <AdminAnalytics data={{
                    labels: stats.revenueByMonth.labels,
                    datasets: [{
                      label: 'Revenue',
                      data: stats.revenueByMonth.data,
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      borderColor: 'rgb(99, 102, 241)',
                      borderWidth: 2,
                      tension: 0.4,
                      fill: true
                    }]
                  }} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Activity className="h-16 w-16 text-muted animate-pulse" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Products */}
            <Card className="bg-background">
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>
                  Products with the highest revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.topProducts ? (
                    stats.topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded bg-primary-dark bg-opacity-10 flex items-center justify-center">
                          <i className="ri-shield-check-line text-primary"></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-muted-foreground text-sm">{formatCurrency(product.revenue)}</div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-muted-foreground text-xs">{product.subscriptions} subscriptions</div>
                            <div className="text-success text-xs flex items-center">
                              <ArrowUp className="mr-1 h-3 w-3" /> {Math.floor(Math.random() * 20)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-40">
                      <p className="text-muted-foreground">No product data available</p>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <Link href="/admin/products" className="text-primary hover:text-primary-hover text-sm flex items-center justify-center">
                      <span>View All Products</span>
                      <i className="ri-arrow-right-line ml-1"></i>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* User Activity */}
            <Card className="bg-background">
              <CardHeader>
                <CardTitle>Recent User Activity</CardTitle>
                <CardDescription>
                  Latest actions taken by users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary-dark bg-opacity-10 flex items-center justify-center">
                      <i className="ri-user-add-line text-primary"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">New User Registration</div>
                          <div className="text-muted-foreground text-sm">alex.johnson@example.com</div>
                        </div>
                        <div className="text-muted-foreground text-xs">2 mins ago</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-success bg-opacity-10 flex items-center justify-center">
                      <i className="ri-shopping-cart-line text-success"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">New Subscription</div>
                          <div className="text-muted-foreground text-sm">Cloud Defender Pro - Annual Plan</div>
                        </div>
                        <div className="text-muted-foreground text-xs">15 mins ago</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-warning bg-opacity-10 flex items-center justify-center">
                      <i className="ri-question-line text-warning"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">Support Ticket Opened</div>
                          <div className="text-muted-foreground text-sm">Installation issue with DataSync Pro</div>
                        </div>
                        <div className="text-muted-foreground text-xs">42 mins ago</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Link href="/admin/users" className="text-primary hover:text-primary-hover text-sm flex items-center justify-center">
                      <span>View All Activity</span>
                      <i className="ri-arrow-right-line ml-1"></i>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>
                Comprehensive analytics for your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Generate and download reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">Report functionality coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
