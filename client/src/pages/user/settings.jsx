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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { UserSidebar } from '@/components/layout/sidebar';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  User, 
  KeyRound, 
  Bell, 
  Info
} from 'lucide-react';

export default function UserSettingsPage() {
  const [location, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Form state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    username: '',
    email: ''
  });
  
  const [walletAddress, setWalletAddress] = useState('');
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    subscriptionReminders: true,
    productUpdates: true,
    marketingEmails: false
  });
  
  // Fetch current user
  const { 
    data: user,
    isLoading: isUserLoading,
    error
  } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('PATCH', '/api/auth/profile', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate user query to refetch updated user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
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
  
  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('PATCH', '/api/auth/password', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update password');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });
      
      // Reset password form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password.",
        variant: "destructive",
      });
    },
  });
  
  // Update notification settings mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('PATCH', '/api/auth/notifications', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update notification settings');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update notification settings.",
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
    if (user) {
      // Set initial form values from user data
      setProfileForm({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || ''
      });
      
      setWalletAddress(user.walletAddress || '');
      
      // Set notification settings if available
      if (user.notificationSettings) {
        setNotificationSettings(user.notificationSettings);
      }
    }
  }, [user]);
  
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };
  
  const handleWalletSubmit = (e) => {
    e.preventDefault();
    if (walletAddress) {
      updateWalletMutation.mutate(walletAddress);
    }
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    
    updatePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
  };
  
  const handleNotificationToggle = (key) => {
    setNotificationSettings(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      // Save changes immediately
      updateNotificationsMutation.mutate(updated);
      return updated;
    });
  };
  
  // Combine our controlled loading state with the query loading states
  const loading = isLoading || isUserLoading;

  return (
    <div className="bg-background pb-16">
      <Helmet>
        <title>Account Settings - Mechxer</title>
        <meta name="description" content="Manage your account settings on Mechxer" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile, security, and preferences
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <UserSidebar user={user} />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-4">
            {loading ? (
              <div className="space-y-6">
                <div className="bg-muted h-12 rounded-xl animate-pulse"></div>
                <div className="bg-muted h-60 rounded-xl animate-pulse"></div>
                <div className="bg-muted h-60 rounded-xl animate-pulse"></div>
              </div>
            ) : (
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="profile" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Profile</span>
                  </TabsTrigger>
                  <TabsTrigger value="wallet" className="flex items-center">
                    <Wallet className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Wallet</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center">
                    <KeyRound className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Security</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Notifications</span>
                  </TabsTrigger>
                </TabsList>
                
                {/* Profile Tab */}
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal details and public profile
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleProfileSubmit}>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input 
                              id="fullName"
                              value={profileForm.fullName}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                              placeholder="Your full name"
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input 
                              id="username"
                              value={profileForm.username}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                              placeholder="Your username"
                              disabled
                            />
                            <p className="text-xs text-muted-foreground">
                              Username cannot be changed after registration
                            </p>
                          </div>
                          
                          <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input 
                              id="email"
                              type="email"
                              value={profileForm.email}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="Your email address"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <Button 
                            type="submit" 
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Wallet Tab */}
                <TabsContent value="wallet">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cryptocurrency Wallet</CardTitle>
                      <CardDescription>
                        Manage your wallet address for crypto transactions
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
                        
                        <div className="flex items-start space-x-2 rounded-md border p-4 bg-muted/50">
                          <Info className="h-5 w-5 text-primary mt-0.5" />
                          <div className="text-sm">
                            <p className="mb-1 font-medium">Important: Verify your wallet address</p>
                            <p className="text-muted-foreground">
                              Always double-check that your ETH address is correct. Transactions sent to the wrong address 
                              cannot be recovered. This address will be used for all your subscriptions on Mechxer.
                            </p>
                          </div>
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
                </TabsContent>
                
                {/* Security Tab */}
                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>
                        Update your password to keep your account secure
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input 
                            id="currentPassword"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            required
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input 
                            id="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            required
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input 
                            id="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          disabled={
                            updatePasswordMutation.isPending || 
                            !passwordForm.currentPassword || 
                            !passwordForm.newPassword || 
                            !passwordForm.confirmPassword
                          }
                        >
                          {updatePasswordMutation.isPending ? "Updating..." : "Change Password"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Notifications Tab */}
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>
                        Choose which updates and notifications you want to receive
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="emailNotifications">Email Notifications</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive important account notifications via email
                              </p>
                            </div>
                            <Switch
                              id="emailNotifications"
                              checked={notificationSettings.emailNotifications}
                              onCheckedChange={() => handleNotificationToggle('emailNotifications')}
                              disabled={updateNotificationsMutation.isPending}
                            />
                          </div>
                          
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="subscriptionReminders">Subscription Reminders</Label>
                              <p className="text-sm text-muted-foreground">
                                Get notified when your subscriptions are about to expire
                              </p>
                            </div>
                            <Switch
                              id="subscriptionReminders"
                              checked={notificationSettings.subscriptionReminders}
                              onCheckedChange={() => handleNotificationToggle('subscriptionReminders')}
                              disabled={updateNotificationsMutation.isPending}
                            />
                          </div>
                          
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="productUpdates">Product Updates</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive notifications about updates to your subscribed products
                              </p>
                            </div>
                            <Switch
                              id="productUpdates"
                              checked={notificationSettings.productUpdates}
                              onCheckedChange={() => handleNotificationToggle('productUpdates')}
                              disabled={updateNotificationsMutation.isPending}
                            />
                          </div>
                          
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="marketingEmails">Marketing Emails</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive promotional emails and special offers
                              </p>
                            </div>
                            <Switch
                              id="marketingEmails"
                              checked={notificationSettings.marketingEmails}
                              onCheckedChange={() => handleNotificationToggle('marketingEmails')}
                              disabled={updateNotificationsMutation.isPending}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}