import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';

export default function BlogPostPage() {
  // Get the slug from the URL
  const [match, params] = useRoute('/blog/:slug');
  const { slug } = params || {};
  
  // Fetch blog post by slug
  const { 
    data: post, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['/api/blog-posts', slug],
    enabled: !!slug,
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unpublished';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Mock blog post if none available from the API
  // This would be replaced with real data in production
  const mockPost = {
    id: 1,
    title: "Top 5 DevOps Trends in 2023",
    slug: "top-5-devops-trends-2023",
    content: `
      <h2>Introduction</h2>
      <p>DevOps continues to evolve at a rapid pace, with new tools, practices, and technologies emerging constantly. In this article, we'll explore the top 5 DevOps trends that are shaping the industry in 2023.</p>
      
      <h2>1. GitOps</h2>
      <p>GitOps is a paradigm that takes DevOps practices and applies them to infrastructure automation using Git as the single source of truth. With GitOps, all changes to infrastructure and application configuration are made through Git pull requests.</p>
      <p>This approach provides several benefits, including:</p>
      <ul>
        <li>Improved collaboration</li>
        <li>Better version control</li>
        <li>Enhanced auditing capabilities</li>
        <li>Consistent rollbacks</li>
      </ul>
      
      <h2>2. AI-Powered DevOps</h2>
      <p>Artificial Intelligence (AI) and Machine Learning (ML) are increasingly being integrated into DevOps workflows. AI can analyze patterns in deployment cycles, identify potential issues before they happen, and suggest optimizations.</p>
      <p>AI-powered DevOps tools can:</p>
      <ul>
        <li>Predict application issues before they impact users</li>
        <li>Automatically scale resources based on usage patterns</li>
        <li>Optimize test selection and execution</li>
        <li>Provide intelligent alerting to reduce alert fatigue</li>
      </ul>
      
      <h2>3. Infrastructure as Code (IaC) Evolution</h2>
      <p>While IaC has been around for some time, it continues to evolve with new tools and approaches. The latest IaC tools focus on improving security, compliance, and governance.</p>
      <p>Key developments include:</p>
      <ul>
        <li>Policy as Code integration</li>
        <li>Better cross-cloud compatibility</li>
        <li>Enhanced security scanning</li>
        <li>More declarative approaches</li>
      </ul>
      
      <h2>4. Platform Engineering</h2>
      <p>Platform engineering involves building internal developer platforms that abstract away infrastructure complexity and provide self-service capabilities to development teams. This trend recognizes that not all developers need or want to be infrastructure experts.</p>
      <p>Platform engineering delivers:</p>
      <ul>
        <li>Improved developer experience</li>
        <li>Standardized workflows</li>
        <li>Reduced cognitive load on developers</li>
        <li>Better governance and compliance</li>
      </ul>
      
      <h2>5. Security Shifting Further Left</h2>
      <p>DevSecOps continues to mature, with security shifting even further left in the development lifecycle. Security is now being integrated at the earliest stages of development and throughout the CI/CD pipeline.</p>
      <p>Key security trends include:</p>
      <ul>
        <li>Integrated security testing in IDEs</li>
        <li>Automated vulnerability scanning</li>
        <li>Security as Code approaches</li>
        <li>Container security enhancements</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>These trends highlight the continued evolution of DevOps practices, with a focus on improving automation, security, and developer experience. Organizations that adopt these trends will be well-positioned to deliver software more efficiently, securely, and reliably.</p>
    `,
    excerpt: "Discover the most important DevOps trends that will shape the industry in 2023.",
    featuredImage: "https://images.unsplash.com/photo-1555099962-4199c345e5dd",
    authorId: 1,
    authorName: "Admin User",
    isPublished: true,
    publishedAt: "2023-07-15T10:30:00Z",
    createdAt: "2023-07-15T10:30:00Z",
    updatedAt: "2023-07-15T10:30:00Z"
  };

  // Use data from API if available, otherwise use mock data if slug matches
  const postData = post || (slug === mockPost.slug ? mockPost : null);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded animate-pulse w-3/4"></div>
              <div className="flex space-x-4">
                <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
              </div>
              <div className="h-64 bg-muted rounded animate-pulse mt-6"></div>
              <div className="space-y-2 mt-6">
                <div className="h-6 bg-muted rounded animate-pulse"></div>
                <div className="h-6 bg-muted rounded animate-pulse"></div>
                <div className="h-6 bg-muted rounded animate-pulse"></div>
                <div className="h-6 bg-muted rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle post not found
  if (!postData) {
    return (
      <div className="bg-background min-h-screen">
        <Helmet>
          <title>Post Not Found - Mechxer Blog</title>
        </Helmet>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Share functionality
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: postData.title,
        text: postData.excerpt,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="bg-background">
      <Helmet>
        <title>{`${postData.title} - Mechxer Blog`}</title>
        <meta name="description" content={postData.excerpt} />
        {/* Open Graph / Social Media Meta Tags */}
        <meta property="og:title" content={postData.title} />
        <meta property="og:description" content={postData.excerpt} />
        {postData.featuredImage && <meta property="og:image" content={postData.featuredImage} />}
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back to blog link */}
          <div className="mb-6">
            <Button variant="outline" size="sm" asChild>
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
          
          {/* Article header */}
          <article>
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{postData.title}</h1>
              
              <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-y-2">
                <div className="flex items-center mr-6">
                  <User className="h-4 w-4 mr-1" />
                  <span>{postData.authorName || `Author #${postData.authorId}`}</span>
                </div>
                <div className="flex items-center mr-6">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(postData.publishedAt)}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleShare} 
                  className="ml-auto"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </header>
            
            {/* Featured image */}
            {postData.featuredImage && (
              <div className="mb-8">
                <img 
                  src={postData.featuredImage} 
                  alt={postData.title} 
                  className="w-full h-auto rounded-lg"
                />
              </div>
            )}
            
            {/* Article content */}
            <div 
              className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: postData.content }}
            />
          </article>
          
          {/* Article footer */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" asChild>
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}