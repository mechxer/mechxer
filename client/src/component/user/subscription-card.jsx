import { useState } from 'react';
import { Link } from 'wouter';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Download, Settings, Shield, Database, Code } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function to get the appropriate icon based on product name
const getProductIcon = (productName) => {
  if (productName.includes('Defender') || productName.includes('Security')) {
    return <Shield className="text-xl text-primary" />;
  } else if (productName.includes('Data') || productName.includes('Sync')) {
    return <Database className="text-xl text-secondary" />;
  } else if (productName.includes('DevOps') || productName.includes('Code')) {
    return <Code className="text-xl text-primary" />;
  }
  return <Shield className="text-xl text-primary" />;
};

export function SubscriptionCardSkeleton() {
  return (
    <Card className="bg-background-elevated overflow-hidden border border-border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-12 h-12 rounded" />
            <div>
              <Skeleton className="h-6 w-40 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        
        <div className="flex items-center space-x-3 mt-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </Card>
  );
}

export default function SubscriptionCard({ subscription }) {
  const [showPassword, setShowPassword] = useState(false);
  
  if (!subscription) {
    return <SubscriptionCardSkeleton />;
  }

  // Destructure subscription data
  const { product, plan, startDate, endDate, status } = subscription;
  
  return (
    <Card className="bg-background-elevated overflow-hidden border border-border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded bg-primary bg-opacity-10 flex items-center justify-center">
              {getProductIcon(product.name)}
            </div>
            <div>
              <h4 className="font-semibold text-lg">{product.name}</h4>
              <div className="text-muted-foreground text-sm">
                {plan.name} Plan · Renews on {formatDate(endDate, 'short')}
              </div>
            </div>
          </div>
          <div className="bg-success bg-opacity-10 text-success px-3 py-1 rounded-full text-sm">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-muted-foreground text-sm mb-1">Subscription ID</div>
            <div className="font-medium">SUB-{subscription.id}</div>
          </div>
          {product.zipPassword && (
            <div>
              <div className="text-muted-foreground text-sm mb-1">ZIP Password</div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {showPassword ? product.zipPassword : '••••••••••'}
                </span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-5 w-5 p-0 text-primary"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
          <div>
            <div className="text-muted-foreground text-sm mb-1">Amount</div>
            <div className="font-medium">
              {formatCurrency(plan.price)}/{plan.interval === 'month' ? 'month' : 'year'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 mt-6">
          {product.downloadLink && (
            <Button asChild>
              <a href={product.downloadLink} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </a>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href={`/user/subscriptions/${subscription.id}`} className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Manage</span>
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
