import { useState, useEffect } from 'react';
import ProductCard, { ProductCardSkeleton } from './product-card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

export default function ProductList() {
  const [page, setPage] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/products?page=${page}&pageSize=6&active=true`],
  });

  useEffect(() => {
    if (data?.products) {
      setFilteredProducts(data.products);
    }
  }, [data]);

  // Loading UI
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Failed to load products</h3>
        <p className="text-muted-foreground mb-4">
          {error.message || 'There was an error loading the products. Please try again.'}
        </p>
        <Button onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>
    );
  }

  // Empty state
  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground">
          We couldn't find any products matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {filteredProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            plans={[
              // Default plans if not available from API
              { price: 1999, interval: 'mo' },
              { price: 19999, interval: 'year' }
            ]} 
          />
        ))}
      </div>
      
      {/* Pagination */}
      {data?.total > 6 && (
        <div className="mt-10 text-center">
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page * 6 >= data.total}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Showing {Math.min((page - 1) * 6 + 1, data.total)} - {Math.min(page * 6, data.total)} of {data.total} products
          </div>
        </div>
      )}
    </div>
  );
}
