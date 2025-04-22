import LoginForm from '@/components/auth/login-form';
import { Link } from 'wouter';

export default function Login() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to your Mechxer account
          </p>
        </div>
        
        <LoginForm />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
