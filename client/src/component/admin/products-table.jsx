import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Shield, 
  Database, 
  Code 
} from 'lucide-react';

// Helper function to get the appropriate icon based on product name
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

export function ProductsTableSkeleton() {
  return (
    <Card className="bg-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
        <div className="overflow-x-auto">
          <Skeleton className="h-64 w-full" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function ProductsTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch products
  const { 
    data, 
    isLoading 
  } = useQuery({
    queryKey: [`/api/products?page=${page}&pageSize=${pageSize}`],
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiRequest('DELETE', `/api/products/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete product');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate products query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      toast({
        title: 'Product Deleted',
        description: 'The product has been successfully deleted.',
      });
      
      // Reset state
      setProductToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleSelectAllChange = (checked) => {
    if (checked) {
      setSelectedProducts(data?.products?.map(product => product.id) || []);
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId, checked) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredProducts = data?.products?.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return <ProductsTableSkeleton />;
  }

  return (
    <>
      <Card className="bg-background">
        <CardHeader className="flex flex-col space-y-2 xl:space-y-0 xl:flex-row items-start xl:items-center justify-between">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Manage your software products and subscription plans
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/products/new" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row justify-between gap-2">
            <div className="relative max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="flex items-center space-x-2">
              {selectedProducts.length > 0 && (
                <Button variant="outline" size="sm" className="h-10">
                  {selectedProducts.length} selected
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10">
                    <span className="sr-only">Actions</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem disabled={selectedProducts.length === 0}>
                    Export Selected
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Export All</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onCheckedChange={handleSelectAllChange}
                      aria-label="Select all"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price Range</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Platforms</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/5">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={(checked) => handleSelectProduct(product.id, checked)}
                          aria-label={`Select ${product.name}`}
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded bg-primary-dark bg-opacity-10 flex items-center justify-center">
                            {getProductIcon(product.name)}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {product.shortDescription}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge variant={product.isActive ? "success" : "secondary"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {formatCurrency(1999)} - {formatCurrency(3999)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {product.platforms.slice(0, 3).map((platform, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                          {product.platforms.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.platforms.length - 3}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/product/${product.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/products/edit/${product.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteClick(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {data?.products?.length || 0} of {data?.total || 0} products
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!data || page * pageSize >= data.total}
              onClick={() => setPage(prev => prev + 1)}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{productToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
