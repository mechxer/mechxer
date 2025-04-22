import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, User, ChevronRight, Search } from 'lucide-react';

export default function BlogIndexPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch blog posts
  const { 
    data: postsData, 
    isLoading 
  } = useQuery({
    queryKey: ['/api/blog-posts'],
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Mock blog posts if none available from the API
  const mockBlogPosts = [
    {
      id: 1,
      title: "Top 5 DevOps Trends in 2023",
      slug: "top-5-devops-trends-2023",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      excerpt: "Discover the most important DevOps trends that will shape the industry in 2023.",
      featuredImage: "https://images.unsplash.com/photo-1555099962-4199c345e5dd",
      authorId: 1,
      authorName: "Admin User",
      isPublished: true,
      publishedAt: "2023-07-15T10:30:00Z",
      createdAt: "2023-07-15T10:30:00Z",
      updatedAt: "2023-07-15T10:30:00Z"
    },
    {
      id: 2,
      title: "How to Secure Your Cloud Infrastructure",
      slug: "secure-cloud-infrastructure",
      content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      excerpt: "Learn the best practices to keep your cloud infrastructure secure from modern threats.",
      featuredImage: "https://images.unsplash.com/photo-1597733336794-12d05021d510",
      authorId: 1,
      authorName: "Admin User",
      isPublished: true,
      publishedAt: "2023-07-20T14:20:00Z",
      createdAt: "2023-07-20T14:20:00Z",
      updatedAt: "2023-07-20T14:20:00Z"
    },
    {
      id: 3,
      title: "5 Ways to Optimize Your Development Workflow",
      slug: "optimize-development-workflow",
      content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      excerpt: "Boost your productivity with these practical tips for streamlining your development process.",
      featuredImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998",
      authorId: 1,
      authorName: "Admin User",
      isPublished: true,
      publishedAt: "2023-07-25T09:45:00Z",
      createdAt: "2023-07-25T09:45:00Z",
      updatedAt: "2023-07-25T09:45:00Z"
    },
    {
      id: 4,
      title: "Implementing Cryptocurrency Payments in Your Software",
      slug: "implementing-cryptocurrency-payments",
      content: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      excerpt: "A comprehensive guide to adding cryptocurrency payment options to your software products.",
      featuredImage: "https://images.unsplash.com/photo-1621761191319-c6fb62004040",
      authorId: 1,
      authorName: "Admin User",
      isPublished: true,
      publishedAt: "2023-08-05T11:15:00Z",
      createdAt: "2023-08-05T11:15:00Z",
      updatedAt: "2023-08-05T11:15:00Z"
    }
  ];

  // Determine posts to display (API data or mock data)
  const posts = postsData?.posts || mockBlogPosts;
  
  // Filter posts based on search query
  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query)
    );
  });
  
  // Only display published posts
  const publishedPosts = filteredPosts.filter(post => post.isPublished);

  return (
    <div className="bg-background">
      <Helmet>
        <title>Blog - Mechxer</title>
        <meta name="description" content="Read the latest articles, tutorials, and updates from Mechxer" />
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header section */}
          <div className="mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Mechxer Blog</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Stay up-to-date with the latest trends, tutorials, and news in software development and cryptocurrency
            </p>
            
            {/* Search input */}
            <div className="max-w-md mx-auto relative">
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          {/* Blog posts grid */}
          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="bg-card rounded-lg overflow-hidden shadow-md">
                  <div className="h-48 bg-muted animate-pulse"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-muted rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                      <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : publishedPosts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium mb-2">No posts found</h2>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? 
                  "No articles match your search query. Please try a different search term." : 
                  "Check back soon for new articles!"}
              </p>
              {searchQuery && (
                <Button onClick={() => setSearchQuery('')} variant="outline">
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {publishedPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
                  <div className="relative h-48 overflow-hidden">
                    {post.featuredImage ? (
                      <img 
                        src={post.featuredImage} 
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl hover:text-primary transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pb-2 flex-grow">
                    <CardDescription className="text-base text-foreground/80">
                      {post.excerpt}
                    </CardDescription>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(post.publishedAt)}
                    </div>
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {post.authorName || `Author #${post.authorId}`}
                    </div>
                  </CardFooter>
                  
                  <div className="px-6 pb-6 pt-2">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/blog/${post.slug}`}>
                        Read more 
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}