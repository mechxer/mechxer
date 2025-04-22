import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/home";
import Product from "@/pages/product";
import Login from "@/pages/login";
import Register from "@/pages/register";
import UserDashboard from "@/pages/user/dashboard";
import UserSubscriptions from "@/pages/user/subscriptions";
import UserSettings from "@/pages/user/settings";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminUsers from "@/pages/admin/users";
import AdminEmailTemplates from "@/pages/admin/email-templates";
import AdminContent from "@/pages/admin/content";
import AdminBlog from "@/pages/admin/blog";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Dmca from "@/pages/dmca";
import BlogIndex from "@/pages/blog/index";
import BlogPost from "@/pages/blog/post";

function Router() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Switch>
          {/* Public Pages */}
          <Route path="/" component={Home} />
          <Route path="/product/:id" component={Product} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/dmca" component={Dmca} />
          <Route path="/blog" component={BlogIndex} />
          <Route path="/blog/:slug" component={BlogPost} />
          
          {/* User Dashboard Routes */}
          <Route path="/user/dashboard" component={UserDashboard} />
          <Route path="/user/subscriptions" component={UserSubscriptions} />
          <Route path="/user/settings" component={UserSettings} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/email-templates" component={AdminEmailTemplates} />
          <Route path="/admin/content" component={AdminContent} />
          <Route path="/admin/blog" component={AdminBlog} />
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
