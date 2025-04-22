import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Chart colors
const COLORS = ['#6366F1', '#EC4899', '#10B981', '#06B6D4', '#8B5CF6', '#F59E0B'];

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-80 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export default function AdminAnalytics({ data }) {
  const [timeRange, setTimeRange] = useState('30days');
  
  // Fetch analytics data if not provided
  const { 
    data: analyticsData, 
    isLoading 
  } = useQuery({
    queryKey: ['/api/admin/analytics'],
    enabled: !data, // Only fetch if data wasn't passed as prop
  });

  // Demo data if we need to generate a chart
  const getDefaultChartData = () => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: [5000, 7500, 6500, 8000, 9500, 11000, 12500, 11500, 13000, 14500, 13500, 15000],
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Subscribers',
        data: [200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750],
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        borderColor: 'rgb(236, 72, 153)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }
    ]
  });

  // Process chart data
  const [chartData, setChartData] = useState(data || getDefaultChartData());

  useEffect(() => {
    if (data) {
      setChartData(data);
    } else if (analyticsData) {
      // Transform API data to chart format
      // This is just a placeholder - in a real app, you'd transform the API data
      setChartData(getDefaultChartData());
    }
  }, [data, analyticsData]);

  if (isLoading && !data) {
    return <AnalyticsSkeleton />;
  }

  // Demo traffic by country data
  const trafficByCountry = [
    { country: 'United States', visits: 8934, percentage: 36.3 },
    { country: 'United Kingdom', visits: 3241, percentage: 13.2 },
    { country: 'Germany', visits: 2103, percentage: 8.6 },
    { country: 'Canada', visits: 1877, percentage: 7.6 },
    { country: 'France', visits: 1532, percentage: 6.2 },
    { country: 'Others', visits: 6896, percentage: 28.1 }
  ];

  // Demo traffic by device data
  const trafficByDevice = [
    { name: 'Desktop', value: 58.3 },
    { name: 'Mobile', value: 33.7 },
    { name: 'Tablet', value: 8.0 }
  ];

  // Demo traffic by source data
  const trafficBySources = [
    { source: 'Direct', visits: 9832, percentage: 40.0 },
    { source: 'Organic Search', visits: 7345, percentage: 29.9 },
    { source: 'Referral', visits: 3621, percentage: 14.7 },
    { source: 'Social', visits: 2134, percentage: 8.7 },
    { source: 'Email', visits: 1651, percentage: 6.7 }
  ];

  // Demo revenue data for recharts
  const revenueData = [
    { name: 'Jan', revenue: 5000 },
    { name: 'Feb', revenue: 7500 },
    { name: 'Mar', revenue: 6500 },
    { name: 'Apr', revenue: 8000 },
    { name: 'May', revenue: 9500 },
    { name: 'Jun', revenue: 11000 },
    { name: 'Jul', revenue: 12500 },
    { name: 'Aug', revenue: 11500 },
    { name: 'Sep', revenue: 13000 },
    { name: 'Oct', revenue: 14500 },
    { name: 'Nov', revenue: 13500 },
    { name: 'Dec', revenue: 15000 }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="overview" className="flex-1">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="year">Year to date</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Main Chart */}
      <Card className="bg-background">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Revenue trend for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366F1" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Secondary Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Traffic by Country */}
        <Card className="bg-background">
          <CardHeader>
            <CardTitle>Traffic by Country</CardTitle>
            <CardDescription>User sessions by geographic location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trafficByCountry}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="country" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="visits" fill="#6366F1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Traffic by Device */}
        <Card className="bg-background">
          <CardHeader>
            <CardTitle>Traffic by Device</CardTitle>
            <CardDescription>Distribution of user sessions by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficByDevice}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {trafficByDevice.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
