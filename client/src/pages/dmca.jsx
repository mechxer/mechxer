import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';

export default function DmcaPage() {
  // Fetch the DMCA content from the content pages API
  const { data: pageContent, isLoading } = useQuery({
    queryKey: ['/api/content-pages/dmca'],
  });

  // Default content for when the API is not yet connected
  const defaultContent = `
    <h1>DMCA Policy</h1>
    <p class="mb-4">Last updated: April 21, 2025</p>
    
    <p class="mb-4">
      Mechxer respects the intellectual property rights of others and expects its 
      users to do the same. In accordance with the Digital Millennium Copyright Act 
      of 1998 ("DMCA"), we will respond expeditiously to claims of copyright 
      infringement that are reported to our designated copyright agent.
    </p>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">Reporting Claims of Copyright Infringement</h2>
    <p class="mb-4">
      If you are a copyright owner, or authorized on behalf of one, and you believe 
      that your copyrighted work has been infringed, please submit your claim via 
      email to <a href="mailto:dmca@mechxer.com" class="text-primary hover:underline">dmca@mechxer.com</a>, 
      with the subject line: "DMCA Takedown Request."
    </p>
    <p class="mb-4">
      You must include the following information in your claim:
    </p>
    <ol class="list-decimal pl-6 mb-6 space-y-2">
      <li>An electronic or physical signature of the copyright owner or a person authorized to act on behalf of the owner;</li>
      <li>Identification of the copyrighted work claimed to have been infringed;</li>
      <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed;</li>
      <li>Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and, if available, an electronic mail address;</li>
      <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law; and</li>
      <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
    </ol>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">Counter-Notification</h2>
    <p class="mb-4">
      If you believe that your content that was removed is not infringing, or that you have 
      the authorization to post and use the content from the copyright owner, the copyright 
      owner's agent, or pursuant to the law, you may send a counter-notification to our 
      copyright agent. Your counter-notification must include the following information:
    </p>
    <ol class="list-decimal pl-6 mb-6 space-y-2">
      <li>Your physical or electronic signature;</li>
      <li>Identification of the content that has been removed or to which access has been disabled and the location at which the content appeared before it was removed or disabled;</li>
      <li>A statement that you have a good faith belief that the content was removed or disabled as a result of mistake or a misidentification of the content; and</li>
      <li>Your name, address, telephone number, and email address, and a statement that you consent to the jurisdiction of the federal court for the judicial district in which your address is located, or if your address is outside of the United States, for any judicial district in which we may be found, and that you will accept service of process from the person who provided notification of the alleged infringement.</li>
    </ol>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">Repeat Infringers</h2>
    <p class="mb-4">
      It is our policy in appropriate circumstances to disable and/or terminate the accounts 
      of users who are repeat infringers.
    </p>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">Contact Information</h2>
    <p class="mb-4">
      If you have any questions or suggestions regarding our DMCA Policy, please contact us at:
    </p>
    <p class="mb-4">
      <a href="mailto:dmca@mechxer.com" class="text-primary hover:underline">dmca@mechxer.com</a>
    </p>
    <p class="mb-4">
      Mechxer Inc.<br />
      123 Mechxer Street<br />
      Tech District, NY 10001<br />
      United States
    </p>
  `;

  // Use content from API if available, otherwise use default
  const content = pageContent?.content || defaultContent;

  return (
    <div className="bg-background">
      <Helmet>
        <title>DMCA Policy - Mechxer</title>
        <meta name="description" content="DMCA Policy for Mechxer - Copyright infringement reporting procedures" />
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