import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';

export default function TermsPage() {
  // Fetch the terms of service content from the content pages API
  const { data: pageContent, isLoading } = useQuery({
    queryKey: ['/api/content-pages/terms'],
  });

  // Default content for when the API is not yet connected
  const defaultContent = `
    <h1>Terms of Service</h1>
    <p class="mb-4">Last updated: April 21, 2025</p>
    
    <p class="mb-4">
      Please read these Terms of Service ("Terms") carefully before using the Mechxer 
      website and services operated by Mechxer Inc.
    </p>
    
    <p class="mb-4">
      By accessing or using our service, you agree to be bound by these Terms. If you 
      disagree with any part of the terms, you may not access the service.
    </p>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">1. Accounts</h2>
    <p class="mb-4">
      When you create an account with us, you must provide information that is accurate, 
      complete, and current at all times. Failure to do so constitutes a breach of the 
      Terms, which may result in immediate termination of your account.
    </p>
    <p class="mb-4">
      You are responsible for safeguarding the password and wallet address that you use 
      to access the service and for any activities or actions under your account.
    </p>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">2. Subscriptions and Payments</h2>
    <p class="mb-4">
      Mechxer operates a subscription-based service that accepts cryptocurrency as payment.
      By subscribing to a software product, you agree to the following:
    </p>
    <ul class="list-disc pl-6 mb-6 space-y-2">
      <li>All cryptocurrency transactions are final and non-refundable</li>
      <li>Subscription fees are subject to change with notice</li>
      <li>You are responsible for all taxes associated with your subscription</li>
      <li>We are not responsible for any transaction errors due to incorrect wallet addresses</li>
    </ul>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">3. Intellectual Property</h2>
    <p class="mb-4">
      The service and its original content, features, and functionality are and will remain 
      the exclusive property of Mechxer Inc. and its licensors. The service is protected by 
      copyright, trademark, and other laws.
    </p>
    <p class="mb-4">
      Our software products are licensed, not sold. You obtain only the right to use the 
      software according to the license terms for each product.
    </p>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">4. Prohibited Uses</h2>
    <p class="mb-4">
      You may use our service only for lawful purposes and in accordance with these Terms. 
      You agree not to use the service:
    </p>
    <ul class="list-disc pl-6 mb-6 space-y-2">
      <li>In any way that violates any applicable law or regulation</li>
      <li>To attempt to circumvent any security measures</li>
      <li>To engage in any other conduct that restricts or inhibits anyone's use of the service</li>
      <li>To distribute the software to unauthorized third parties</li>
    </ul>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">5. Limitation of Liability</h2>
    <p class="mb-4">
      In no event shall Mechxer Inc., nor its directors, employees, partners, agents, suppliers, 
      or affiliates, be liable for any indirect, incidental, special, consequential or punitive 
      damages, including without limitation, loss of profits, data, use, goodwill, or other 
      intangible losses, resulting from:
    </p>
    <ul class="list-disc pl-6 mb-6 space-y-2">
      <li>Your access to or use of or inability to access or use the service</li>
      <li>Any conduct or content of any third party on the service</li>
      <li>Any content obtained from the service</li>
      <li>Unauthorized access, use or alteration of your transmissions or content</li>
    </ul>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">6. Termination</h2>
    <p class="mb-4">
      We may terminate or suspend your account immediately, without prior notice or liability, 
      for any reason whatsoever, including without limitation if you breach the Terms.
    </p>
    <p class="mb-4">
      Upon termination, your right to use the service will immediately cease. If you wish to 
      terminate your account, you may simply discontinue using the service.
    </p>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">7. Governing Law</h2>
    <p class="mb-4">
      These Terms shall be governed and construed in accordance with the laws of the United States, 
      without regard to its conflict of law provisions.
    </p>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">8. Changes to Terms</h2>
    <p class="mb-4">
      We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
      If a revision is material we will try to provide at least 30 days' notice prior to any new 
      terms taking effect.
    </p>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">9. Contact Us</h2>
    <p class="mb-4">
      If you have any questions about these Terms, please contact us at:
      <a href="mailto:legal@mechxer.com" class="text-primary hover:underline">legal@mechxer.com</a>
    </p>
  `;

  // Use content from API if available, otherwise use default
  const content = pageContent?.content || defaultContent;

  return (
    <div className="bg-background">
      <Helmet>
        <title>Terms of Service - Mechxer</title>
        <meta name="description" content="Terms of Service for Mechxer - Read our terms and conditions" />
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