import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export default function ContactPage() {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });
  
  const contactMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/contact', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "We've received your message and will get back to you soon.",
      });
      setIsSuccess(true);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data) {
    contactMutation.mutate(data);
  }
  
  return (
    <div className="bg-background">
      <Helmet>
        <title>Contact Us - Mechxer</title>
        <meta name="description" content="Contact Mechxer for support, business inquiries, or general questions." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-muted-foreground">
            Questions, feedback, or business inquiries? We'd love to hear from you.
            Our team is here to help.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Contact Information Cards */}
          <Card className="bg-card/50 border border-border">
            <CardHeader className="pb-2">
              <Mail className="h-8 w-8 text-primary mb-4" />
              <CardTitle className="text-lg">Email Us</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                <a 
                  href="mailto:support@mechxer.com" 
                  className="text-primary hover:underline"
                >
                  support@mechxer.com
                </a>
                <p className="mt-1 text-muted-foreground">
                  We respond within 24 hours
                </p>
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border border-border">
            <CardHeader className="pb-2">
              <Phone className="h-8 w-8 text-primary mb-4" />
              <CardTitle className="text-lg">Call Us</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                <a 
                  href="tel:+11234567890" 
                  className="text-primary hover:underline"
                >
                  +1 (123) 456-7890
                </a>
                <p className="mt-1 text-muted-foreground">
                  Mon-Fri, 9AM-5PM EST
                </p>
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border border-border">
            <CardHeader className="pb-2">
              <MapPin className="h-8 w-8 text-primary mb-4" />
              <CardTitle className="text-lg">Visit Us</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                <p className="text-primary">
                  123 Mechxer Street
                </p>
                <p className="mt-1 text-muted-foreground">
                  Tech District, NY 10001
                </p>
              </CardDescription>
            </CardContent>
          </Card>
        </div>
        
        {/* Contact Form */}
        <div className="max-w-3xl mx-auto mt-16">
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="bg-primary/10 inline-flex items-center justify-center p-4 rounded-full mb-4">
                    <Check className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for reaching out. We'll get back to you shortly.
                  </p>
                  <Button
                    onClick={() => setIsSuccess(false)}
                    variant="outline"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="What's this about?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us how we can help..." 
                              rows={5}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={contactMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {contactMutation.isPending ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}