import { useState } from "react";
import { apiRequest, fetchWithAuth } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle, ArrowRight, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Helper function to format currency for display
function formatCurrency(amount: number, currency: string): string {
  return `${amount.toFixed(6)} ${currency}`;
}

interface CryptoCheckoutProps {
  productId: number;
  planId: number;
  onSuccess: () => void;
}

export function CryptoCheckout({ productId, planId, onSuccess }: CryptoCheckoutProps) {
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Load data when component mounts
  useState(() => {
    async function loadData() {
      setLoading(true);
      try {
        const userData = await fetchWithAuth("/api/auth/me");
        setUser(userData);
        
        if (planId) {
          const planData = await fetchWithAuth(`/api/subscription-plans/${planId}`);
          setPlan(planData);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  });
  
  // Submit payment transaction
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!txHash.trim()) {
      toast({
        title: "Error",
        description: "Please enter a transaction hash",
        variant: "destructive",
      });
      return;
    }
    
    if (!plan) {
      toast({
        title: "Error",
        description: "Plan information is not available",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create transaction record
      const transRes = await apiRequest("POST", "/api/crypto-transactions", {
        txHash,
        amount: plan.priceCrypto,
        currency: plan.cryptoCurrency
      });
      
      const transData = await transRes.json();
      
      // Create subscription with transaction ID
      await apiRequest("POST", "/api/subscriptions", { 
        productId, 
        planId,
        transactionId: transData.id
      });
      
      toast({
        title: "Success!",
        description: "Your subscription has been activated. Payment is being processed.",
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "There was a problem with your transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  function copyWalletAddress() {
    if (plan?.walletAddress) {
      navigator.clipboard.writeText(plan.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user?.walletAddress) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Wallet Required</AlertTitle>
        <AlertDescription>
          You need to set up a cryptocurrency wallet in your account settings before making a payment.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cryptocurrency Payment</CardTitle>
        <CardDescription>
          Complete your subscription payment with cryptocurrency
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Payment Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Product:</div>
            <div className="font-medium">{plan?.productName}</div>
            
            <div>Plan:</div>
            <div className="font-medium">{plan?.name}</div>
            
            <div>Amount:</div>
            <div className="font-medium">
              {formatCurrency(plan?.priceCrypto || 0, plan?.cryptoCurrency || 'ETH')}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium mb-2">Payment Instructions</h3>
          <Alert>
            <div className="space-y-2">
              <p>Send exactly <span className="font-bold">{formatCurrency(plan?.priceCrypto || 0, plan?.cryptoCurrency || 'ETH')}</span> to:</p>
              
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                <code className="font-mono text-sm flex-1 break-all">
                  {plan?.walletAddress || "0x1234567890abcdef1234567890abcdef12345678"}
                </code>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyWalletAddress}
                  className="ml-2"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              <p className="text-amber-600 dark:text-amber-500 font-medium">
                Important: After sending the payment, submit the transaction hash below to activate your subscription.
              </p>
            </div>
          </Alert>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="txHash" className="block text-sm font-medium">
              Transaction Hash
            </label>
            <Input
              id="txHash"
              placeholder="Enter your transaction hash"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              className="font-mono"
            />
            <p className="text-sm text-gray-500">
              The transaction hash or ID from your cryptocurrency wallet after making the payment.
            </p>
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Complete Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}