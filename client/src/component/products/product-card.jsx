import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Database, Code } from 'lucide-react';

const getProductIcon = (productName) => {
  if (productName.includes('Defender') || productName.includes('Security')) {
    return <Shield className="text-primary" />;
  } else if (productName.includes('Data') || productName.includes('Sync')) {
    return <Database className="text-secondary" />;
  } else if (productName.includes('DevOps') || productName.includes('Code')) {
    return <Code className="text-primary-dark" />;
  }
  return <Shield className="text-primary" />;
};

export function ProductCardSkeleton() {
  return (
    <Card className="bg-background-elevated rounded-lg overflow-hidden border border-border">
      <CardContent className="p-6 flex flex-col md:flex-row gap-6">
        <Skeleton className="w-full md:w-64 h-40 rounded-md" />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <Skeleton className="h-8 w-2/3 mb-3" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="flex flex-wrap gap-2 mb-4">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProductCard({ product, plans }) {
  if (!product) return <ProductCardSkeleton />;

  // Get the lowest price from available plans
  const lowestPricePlan = plans && plans.length > 0 
    ? plans.reduce((lowest, plan) => plan.price < lowest.price ? plan : lowest, plans[0]) 
    : null;

  const getLowestPriceDisplay = () => {
    if (!lowestPricePlan) return 'Contact for pricing';
    const formattedPrice = formatCurrency(lowestPricePlan.price);
    return `From ${formattedPrice}/${lowestPricePlan.interval}`;
  };

  return (
    <Card className="bg-background-elevated rounded-lg overflow-hidden border border-border hover:border-primary transition-all transform hover:-translate-y-1 duration-300">
      <CardContent className="p-6 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 h-40 rounded-md overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-background-card flex items-center justify-center">
              <div className="text-4xl">{getProductIcon(product.name)}</div>
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-2xl font-display font-semibold">{product.name}</h3>
            <Badge variant="outline" className="bg-primary-dark bg-opacity-20 text-primary-hover">
              {getLowestPriceDisplay()}
            </Badge>
          </div>
          <p className="text-muted-foreground mb-4">{product.shortDescription}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {product.platforms.map((platform, index) => (
              <Badge key={index} variant="outline" className="bg-background-card">
                {platform}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-secondary">
              {getProductIcon(product.name)}
              <span className="text-sm">{product.platforms.length} Platforms</span>
            </div>
            <Button asChild className="bg-primary hover:bg-primary-hover text-white">
              <Link href={`/product/${product.id}`} className="flex items-center space-x-2">
                <span>BUY</span>
                <i className="ri-shopping-cart-line"></i>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
