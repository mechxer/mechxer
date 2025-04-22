import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input';
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
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import {
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  User,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';

export function UserManagementSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div>
            <Skeleton className="h-7 w-32 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function UserManagement() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch users
  const { 
    data, 
    isLoading 
  } = useQuery({
    queryKey: [`/api/admin/users?page=${page}&pageSize=${pageSize}`],
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiRequest('DELETE', `/api/users/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      
      toast({
        title: 'User Deleted',
        description: 'The user has been successfully deleted.',
      });
      
      // Reset state
      setUserToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Mock users data since we don't have a real API response yet
  const mockUsers = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@mechxer.com',
      fullName: 'Admin User',
      role: 'admin',
      isVerified: true,
      createdAt: '2023-05-15T10:30:00Z',
      subscriptionsCount: 3
    },
    {
      id: 2,
      username: 'johndoe',
      email: 'john@example.com',
      fullName: 'John Doe',
      role: 'user',
      isVerified: true,
      createdAt: '2023-06-10T14:20:00Z',
      subscriptionsCount: 2
    },
    {
      id: 3,
      username: 'janedoe',
      email: 'jane@example.com',
      fullName: 'Jane Doe',
      role: 'user',
      isVerified: true,
      createdAt: '2023-06-15T09:45:00Z',
      subscriptionsCount: 1
    },
    {
      id: 4,
      username: 'bobsmith',
      email: 'bob@example.com',
      fullName: 'Bob Smith',
      role: 'user',
      isVerified: false,
      createdAt: '2023-07-05T16:10:00Z',
      subscriptionsCount: 0
    },
    {
      id: 5,
      username: 'alicejones',
      email: 'alice@example.com',
      fullName: 'Alice Jones',
      role: 'user',
      isVerified: true,
      createdAt: '2023-07-20T11:25:00Z',
      subscriptionsCount: 1
    }
  ];

  // Filter users by search query
  const users = data?.users || mockUsers;
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return <UserManagementSkeleton />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-2 xl:space-y-0 xl:flex-row items-start xl:items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </div>
            <Button>
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row justify-between gap-2">
            <div className="relative max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subscriptions</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/5">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary">
                            {user.role === 'admin' ? (
                              <Shield className="h-4 w-4" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.fullName || user.username}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge variant={user.role === 'admin' ? "secondary" : "outline"}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {user.isVerified ? (
                          <div className="flex items-center text-green-500">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span>Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-amber-500">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span>Unverified</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {formatDate(user.createdAt, 'short')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {user.subscriptionsCount}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="h-4 w-4 mr-2" />
                              <span>Change Role</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteClick(user)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            Showing {filteredUsers.length} of {users.length} users
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
              This will permanently delete the user account for "{userToDelete?.username}". This action cannot be undone.
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
