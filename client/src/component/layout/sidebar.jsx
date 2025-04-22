import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  User,
  Home, 
  CreditCard, 
  Settings, 
  Package, 
  Users,
  Mail,
  FileText,
  BookOpen,
  BarChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// User sidebar for dashboard
export function UserSidebar({ user }) {
  const [location] = useLocation();

  // Sidebar navigation items for user
  const userNavItems = [
    {
      title: 'Dashboard',
      href: '/user/dashboard',
      icon: Home
    },
    {
      title: 'Subscriptions',
      href: '/user/subscriptions',
      icon: CreditCard
    },
    {
      title: 'Settings',
      href: '/user/settings',
      icon: Settings
    }
  ];

  // Navigation item component
  const NavItem = ({ item }) => {
    const isActive = location === item.href;
    
    return (
      <Button
        asChild
        variant={isActive ? 'default' : 'ghost'}
        className={cn(
          'w-full justify-start',
          isActive ? 'bg-primary text-primary-foreground' : ''
        )}
      >
        <Link href={item.href}>
          <item.icon className="mr-2 h-4 w-4" />
          {item.title}
        </Link>
      </Button>
    );
  };

  // Loading skeleton
  if (!user) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-8">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // User name or username fallback
  const displayName = user.fullName || user.username;
  // Get initials for avatar
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-4">
      {/* User info */}
      <div className="flex items-center space-x-3 mb-8">
        <Avatar>
          {user.profileImage ? (
            <AvatarImage src={user.profileImage} alt={displayName} />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="font-medium">{displayName}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="space-y-1">
        {userNavItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </div>
    </div>
  );
}

// Admin sidebar for admin dashboard
export function AdminSidebar({ user }) {
  const [location] = useLocation();

  // Sidebar navigation items for admin
  const adminNavItems = [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: BarChart
    },
    {
      title: 'Products',
      href: '/admin/products',
      icon: Package
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: Users
    },
    {
      title: 'Email Templates',
      href: '/admin/email-templates',
      icon: Mail
    },
    {
      title: 'Content Pages',
      href: '/admin/content',
      icon: FileText
    },
    {
      title: 'Blog',
      href: '/admin/blog',
      icon: BookOpen
    }
  ];

  // Navigation item component
  const NavItem = ({ item }) => {
    const isActive = location === item.href;
    
    return (
      <Button
        asChild
        variant={isActive ? 'default' : 'ghost'}
        className={cn(
          'w-full justify-start',
          isActive ? 'bg-primary text-primary-foreground' : ''
        )}
      >
        <Link href={item.href}>
          <item.icon className="mr-2 h-4 w-4" />
          {item.title}
        </Link>
      </Button>
    );
  };

  // Loading skeleton
  if (!user) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-8">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Admin user info
  return (
    <div className="space-y-4">
      {/* User info */}
      <div className="flex items-center space-x-3 mb-8">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">Admin Panel</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      </div>
      
      {/* Admin navigation */}
      <div className="space-y-1">
        {adminNavItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </div>
      
      {/* Return to site link */}
      <div className="pt-4 mt-4 border-t border-border">
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Site
          </Link>
        </Button>
      </div>
    </div>
  );
}