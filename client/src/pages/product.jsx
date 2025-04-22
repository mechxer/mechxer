import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import ProductDetail from '@/components/products/product-detail';

export default function Product() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch product details
  const { 
    data: productData, 
    error,
    isLoading: isProductLoading 
  } = useQuery({
    queryKey: [`/api/products/${id}`],
  });

  useEffect(() => {
    // Only show loading state for the initial load to prevent flashing
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Combine our controlled loading state with the query loading state
  const loading = isLoading || isProductLoading;

  if (error) {
    return (
      <div className="bg-background-elevated py-16">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Error Loading Product</h2>
            <p className="text-muted-foreground mb-6">
              {error.message || "There was an error loading the product details. Please try again."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary-hover text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-background-elevated py-16">
      <div className="container mx-auto px-4">
        {loading ? (
          <ProductDetail product={null} plans={null} />
        ) : (
          <ProductDetail 
            product={productData?.product} 
            plans={productData?.plans} 
          />
        )}
      </div>
    </section>
  );
}
