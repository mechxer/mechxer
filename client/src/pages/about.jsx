import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';

export default function AboutPage() {
  // Fetch the about page content from the content pages API
  const { data: pageContent, isLoading } = useQuery({
    queryKey: ['/api/content-pages/about'],
  });

  // Default content for when the API is not yet connected
  const defaultContent = `
    <h1>About Mechxer</h1>
    <p class="mb-4">
      Mechxer is a premium software subscription marketplace that connects developers 
      with high-quality software tools and utilities.
    </p>
    <p class="mb-4">
      Our mission is to simplify software distribution and subscription management
      by providing a secure platform for both developers and users.
    </p>
    <h2 class="text-2xl font-bold mt-8 mb-4">Our Vision</h2>
    <p class="mb-4">
      We believe in a future where software procurement and distribution is seamless,
      secure, and fair for everyone involved. By leveraging cryptocurrency payments,
      we're creating a more efficient ecosystem that reduces friction and costs.
    </p>
    <h2 class="text-2xl font-bold mt-8 mb-4">The Mechxer Advantage</h2>
    <ul class="list-disc pl-6 mb-6 space-y-2">
      <li>Secure cryptocurrency payments with no middleman fees</li>
      <li>Verified software from trusted developers</li>
      <li>Seamless subscription management</li>
      <li>Automated license delivery and updates</li>
      <li>Easy-to-use platform for both developers and users</li>
    </ul>
    <p class="mb-4">
      Whether you're a software developer looking to distribute your products or a user
      seeking quality software solutions, Mechxer is designed with you in mind.
    </p>
  `;

  // Use content from API if available, otherwise use default
  const content = pageContent?.content || defaultContent;

  return (
    <div className="bg-background">
      <Helmet>
        <title>About - Mechxer</title>
        <meta name="description" content="Learn about Mechxer - the premium software subscription marketplace" />
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            // Loading state
            <div className="space-y-4">
              <div className="h-12 bg-muted rounded animate-pulse w-1/3"></div>
              <div className="h-6 bg-muted rounded animate-pulse"></div>
              <div className="h-6 bg-muted rounded animate-pulse"></div>
              <div className="h-6 bg-muted rounded animate-pulse w-3/4"></div>
              <div className="h-8 bg-muted rounded animate-pulse mt-8 w-1/4"></div>
              <div className="h-6 bg-muted rounded animate-pulse"></div>
              <div className="h-6 bg-muted rounded animate-pulse"></div>
              <div className="space-y-2 mt-6">
                <div className="h-6 bg-muted rounded animate-pulse w-3/4"></div>
                <div className="h-6 bg-muted rounded animate-pulse w-2/3"></div>
                <div className="h-6 bg-muted rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          ) : (
            // Content from API or default
            <div 
              className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </div>
    </div>
  );
}