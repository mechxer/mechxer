import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { AdminSidebar } from '@/components/layout/sidebar';
import UserManagement from '@/components/admin/user-management';

export default function AdminUsersPage() {
  const [location, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch current user
  const { 
    data: user,
    isLoading: isUserLoading,
    error
  } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false
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
    // Redirect to login if user is not an admin
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Combine our controlled loading state with the query loading state
  const loading = isLoading || isUserLoading;

  return (
    <div className="bg-background pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <AdminSidebar user={user} />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-4">
            {loading ? (
              <div className="bg-muted h-96 rounded-xl animate-pulse"></div>
            ) : (
              <UserManagement />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
