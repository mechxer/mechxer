import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useTheme } from '@/components/ui/theme-provider';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, ChevronDown, Moon, Sun, User, LogOut, Settings } from 'lucide-react';
import { apiRequest, fetchOptionalAuth } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  // Check if user is authenticated
  const { data: user, isLoading: isAuthLoading, refetch: refetchUser } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: () => fetchOptionalAuth('/api/auth/me'),
  });

  // Handle logout
  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      refetchUser();
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account',
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout Failed',
        description: 'There was an error logging out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-primary text-3xl">
              <i className="ri-code-box-line"></i>
            </div>
            <span className="hidden font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-2xl font-display sm:inline-block">
              Mechxer
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className={`text-sm hover:text-primary transition-colors ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
              Home
            </Link>
            <Link href="/products" className={`text-sm hover:text-primary transition-colors ${location === '/products' ? 'text-primary' : 'text-muted-foreground'}`}>
              Products
            </Link>
            <Link href="/blog" className={`text-sm hover:text-primary transition-colors ${location === '/blog' ? 'text-primary' : 'text-muted-foreground'}`}>
              Blog
            </Link>
            <Link href="/about" className={`text-sm hover:text-primary transition-colors ${location === '/about' ? 'text-primary' : 'text-muted-foreground'}`}>
              About
            </Link>
            <Link href="/contact" className={`text-sm hover:text-primary transition-colors ${location === '/contact' ? 'text-primary' : 'text-muted-foreground'}`}>
              Contact
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="mr-2"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>

          {/* User Authentication */}
          {isAuthLoading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/user/dashboard" className="cursor-pointer flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="cursor-pointer flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container px-4 py-2">
            <nav className="flex flex-col space-y-3 py-3">
              <Link href="/" className="py-2 text-sm hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/products" className="py-2 text-sm hover:text-primary transition-colors">
                Products
              </Link>
              <Link href="/blog" className="py-2 text-sm hover:text-primary transition-colors">
                Blog
              </Link>
              <Link href="/about" className="py-2 text-sm hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/contact" className="py-2 text-sm hover:text-primary transition-colors">
                Contact
              </Link>
              {!user && (
                <div className="flex flex-col space-y-2 pt-2">
                  <Button variant="outline" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Get Started</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

