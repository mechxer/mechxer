import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';

export default function PrivacyPolicyPage() {
  // Fetch the privacy policy content from the content pages API
  const { data: pageContent, isLoading } = useQuery({
    queryKey: ['/api/content-pages/privacy'],
  });

  // Default content for when the API is not yet connected
  const defaultContent = `
    <h1>Privacy Policy</h1>
    <p class="mb-4">Last updated: April 21, 2025</p>
    
    <p class="mb-4">
      At Mechxer, we take your privacy seriously. This Privacy Policy explains how we collect, 
      use, disclose, and safeguard your information when you visit our website and use our services.
    </p>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
    
    <h3 class="text-xl font-bold mt-6 mb-2">Personal Information</h3>
    <p class="mb-4">
      We may collect personal information that you voluntarily provide to us when you:
    </p>
    <ul class="list-disc pl-6 mb-6 space-y-2">
      <li>Register for an account</li>
      <li>Subscribe to software products</li>
      <li>Contact us with inquiries</li>
      <li>Respond to surveys</li>
      <li>Participate in promotions</li>
    </ul>
    <p class="mb-4">
      This information may include your name, email address, wallet address, 
      and other information you choose to provide.
    </p>
    
    <h3 class="text-xl font-bold mt-6 mb-2">Non-Personal Information</h3>
    <p class="mb-4">
      We may also collect non-personal information about you such as browser type,
      IP address, device type, and operating system. This information is collected
      automatically when you use our services.
    </p>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
    <p class="mb-4">We may use the information we collect for various purposes, including to:</p>
    <ul class="list-disc pl-6 mb-6 space-y-2">
      <li>Provide, maintain, and improve our services</li>
      <li>Process transactions and send related information</li>
      <li>Send administrative messages and updates</li>
      <li>Respond to inquiries and offer support</li>
      <li>Monitor usage patterns and analyze trends</li>
      <li>Protect against unauthorized access</li>
    </ul>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">Disclosure of Your Information</h2>
    <p class="mb-4">
      We do not sell, trade, rent, or otherwise transfer your personal information to 
      third parties without your consent, except as described in this Privacy Policy.
    </p>
    <p class="mb-4">
      We may disclose your information in the following situations:
    </p>
    <ul class="list-disc pl-6 mb-6 space-y-2">
      <li>To comply with legal obligations</li>
      <li>To protect and defend our rights and property</li>
      <li>To prevent or investigate possible wrongdoing</li>
      <li>With your consent or at your direction</li>
    </ul>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">Security</h2>
    <p class="mb-4">
      We use administrative, technical, and physical security measures to protect your 
      personal information. However, no system is completely secure, and we cannot guarantee
      the absolute security of your information.
    </p>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">Your Rights</h2>
    <p class="mb-4">
      Depending on your location, you may have rights regarding your personal information,
      such as the right to access, correct, delete, or restrict use of your information.
    </p>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">Changes to This Privacy Policy</h2>
    <p class="mb-4">
      We may update our Privacy Policy from time to time. We will notify you of any 
      changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
    </p>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
    <p class="mb-4">
      If you have any questions about this Privacy Policy, please contact us at:
      <a href="mailto:privacy@mechxer.com" class="text-primary hover:underline">privacy@mechxer.com</a>
    </p>
  `;

  // Use content from API if available, otherwise use default
  const content = pageContent?.content || defaultContent;

  return (
    <div className="bg-background">
      <Helmet>
        <title>Privacy Policy - Mechxer</title>
        <meta name="description" content="Privacy Policy for Mechxer - Learn how we protect your information" />
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