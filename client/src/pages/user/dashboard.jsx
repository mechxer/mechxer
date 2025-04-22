import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { UserSidebar } from '@/components/layout/sidebar';
import { Wallet, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function UserDashboardPage() {
  const [location, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');
  const { toast } = useToast();
  
  // Fetch current user
  const { 
    data: user,
    isLoading: isUserLoading,
    error
  } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false
  });
  
  // Fetch user transactions
  const { 
    data: transactions,
    isLoading: isTransactionsLoading
  } = useQuery({
    queryKey: ['/api/crypto-transactions'],
    enabled: !!user,
  });
  
  // Update wallet address mutation
  const updateWalletMutation = useMutation({
    mutationFn: async (walletAddress) => {
      const response = await apiRequest('PATCH', '/api/auth/update-wallet', { walletAddress });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update wallet address');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate user query to refetch updated user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: "Wallet Address Updated",
        description: "Your wallet address has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update wallet address.",
        variant: "destructive",
      });
    },
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
  
  useEffect(() => {
    if (user?.walletAddress) {
      setWalletAddress(user.walletAddress);
    }
  }, [user]);
  
  const handleWalletSubmit = (e) => {
    e.preventDefault();
    if (walletAddress) {
      updateWalletMutation.mutate(walletAddress);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get badge color based on transaction status
  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
        return (
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">{status}</span>
          </div>
        );
      case 'pending':
      case 'processing':
        return (
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-yellow-500 font-medium">{status}</span>
          </div>
        );
      case 'failed':
      case 'rejected':
        return (
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-destructive mr-1" />
            <span className="text-destructive font-medium">{status}</span>
          </div>
        );
      default:
        return <span>{status}</span>;
    }
  };

  // Mock transactions if none available from the API
  const mockTransactions = [
    {
      id: 1,
      txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
      amount: "0.15",
      currency: "ETH",
      status: "Completed",
      createdAt: "2023-07-10T14:30:00Z",
      confirmedAt: "2023-07-10T14:40:00Z",
      productName: "Cloud Defender Pro - Annual",
      subscriptionId: 1
    },
    {
      id: 2,
      txHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
      amount: "0.08",
      currency: "ETH",
      status: "Pending",
      createdAt: "2023-08-05T09:15:00Z",
      confirmedAt: null,
      productName: "DataSync Pro - Monthly",
      subscriptionId: 2
    }
  ];
  
  const transactionsData = transactions || mockTransactions;
  
  // Combine our controlled loading state with the query loading states
  const loading = isLoading || isUserLoading;

  return (
    <div className="bg-background pb-16">
      <Helmet>
        <title>Dashboard - Mechxer</title>
        <meta name="description" content="Manage your subscriptions and wallet on Mechxer" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Your Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your subscriptions and cryptocurrency wallet
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
                <div className="bg-muted h-96 rounded-xl animate-pulse"></div>
              </div>
            ) : (
              <>
                {/* Wallet Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Wallet className="h-5 w-5 mr-2" />
                      Cryptocurrency Wallet
                    </CardTitle>
                    <CardDescription>
                      Connect your crypto wallet to pay for subscriptions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleWalletSubmit} className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="walletAddress">ETH Wallet Address</Label>
                        <Input 
                          id="walletAddress"
                          placeholder="0x..."
                          value={walletAddress}
                          onChange={(e) => setWalletAddress(e.target.value)}
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter your Ethereum wallet address to receive subscription confirmations and make payments.
                        </p>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={updateWalletMutation.isPending || !walletAddress}
                      >
                        {updateWalletMutation.isPending ? "Updating..." : "Update Wallet Address"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                
                {/* Transactions Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>
                      View your cryptocurrency transaction history for subscriptions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isTransactionsLoading ? (
                      <div className="space-y-3">
                        <div className="h-10 bg-muted rounded animate-pulse"></div>
                        <div className="h-12 bg-muted rounded animate-pulse"></div>
                        <div className="h-12 bg-muted rounded animate-pulse"></div>
                      </div>
                    ) : transactionsData.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">
                          You haven't made any transactions yet.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Product</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Transaction Hash</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactionsData.map((tx) => (
                              <TableRow key={tx.id}>
                                <TableCell>{formatDate(tx.createdAt)}</TableCell>
                                <TableCell>{tx.productName}</TableCell>
                                <TableCell>
                                  {tx.amount} {tx.currency}
                                </TableCell>
                                <TableCell>{getStatusBadge(tx.status)}</TableCell>
                                <TableCell className="font-mono text-xs truncate max-w-[120px]">
                                  <a 
                                    href={`https://etherscan.io/tx/${tx.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary"
                                  >
                                    {tx.txHash}
                                  </a>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
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