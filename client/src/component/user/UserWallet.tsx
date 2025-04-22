import { useState, useEffect } from "react";
import { apiRequest, fetchWithAuth } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Helper functions for formatting
function formatDate(date: string | Date): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  }
  
  // For crypto currencies, show more decimal places
  return `${amount.toFixed(6)} ${currency}`;
}

export function UserWallet() {
  const [walletAddress, setWalletAddress] = useState("");
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  // Fetch user profile with wallet address
  useEffect(() => {
    async function fetchUserData() {
      setIsLoadingUser(true);
      try {
        const userData = await fetchWithAuth("/api/auth/me");
        setUser(userData);
        
        // Fetch transactions after getting user data
        if (userData) {
          fetchTransactions();
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setIsLoadingUser(false);
      }
    }
    
    fetchUserData();
  }, []);
  
  // Fetch transaction history
  async function fetchTransactions() {
    setIsLoadingTransactions(true);
    try {
      const transactionsData = await fetchWithAuth("/api/crypto-transactions");
      setTransactions(transactionsData || []);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transaction history",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTransactions(false);
    }
  }
  
  // Update wallet address
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!walletAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid wallet address",
        variant: "destructive",
      });
      return;
    }
    
    setIsUpdating(true);
    try {
      await apiRequest("PATCH", "/api/auth/update-wallet", { walletAddress: walletAddress });
      
      // Refresh user data
      const updatedUser = await fetchWithAuth("/api/auth/me");
      setUser(updatedUser);
      
      toast({
        title: "Wallet updated",
        description: "Your cryptocurrency wallet has been updated successfully.",
      });
      setWalletAddress("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update wallet address",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };
  
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cryptocurrency Wallet</CardTitle>
          <CardDescription>
            Manage your wallet address for cryptocurrency payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label>Current Wallet Address</Label>
            <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-md font-mono text-sm break-all">
              {user?.walletAddress || "No wallet address set"}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="walletAddress">New Wallet Address</Label>
              <Input
                id="walletAddress"
                placeholder="Enter your cryptocurrency wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : "Update Wallet Address"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View your cryptocurrency transaction history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : transactions && transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Transaction Hash</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx: any) => (
                  <TableRow key={tx.id}>
                    <TableCell>{formatDate(tx.createdAt)}</TableCell>
                    <TableCell>{formatCurrency(tx.amount, tx.currency)}</TableCell>
                    <TableCell>{tx.currency}</TableCell>
                    <TableCell className="font-mono text-xs break-all">
                      {tx.txHash.substring(0, 10)}...{tx.txHash.substring(tx.txHash.length - 10)}
                    </TableCell>
                    <TableCell className="flex items-center space-x-1">
                      {getStatusIcon(tx.status)}
                      <span>{tx.status}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No transactions found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}