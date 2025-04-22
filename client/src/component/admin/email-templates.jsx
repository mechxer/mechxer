import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  Mail,
  Save
} from 'lucide-react';

export function EmailTemplatesManagementSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div>
            <Skeleton className="h-7 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="border border-border rounded-md p-4">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-48" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function EmailTemplatesManagement() {
  const [templateToEdit, setTemplateToEdit] = useState(null);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Create default form state
  const defaultFormState = {
    name: '',
    subject: '',
    content: ''
  };
  
  const [formValues, setFormValues] = useState(defaultFormState);
  
  // Fetch email templates
  const { 
    data: templates, 
    isLoading 
  } = useQuery({
    queryKey: ['/api/email-templates'],
  });

  // Create email template mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/email-templates', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create email template');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates'] });
      
      toast({
        title: 'Template Created',
        description: 'The email template has been successfully created.',
      });
      
      // Reset form and close dialog
      setFormValues(defaultFormState);
      setCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create email template',
        variant: 'destructive',
      });
    },
  });

  // Update email template mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest('PATCH', `/api/email-templates/${id}`, data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update email template');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates'] });
      
      toast({
        title: 'Template Updated',
        description: 'The email template has been successfully updated.',
      });
      
      // Reset state and close dialog
      setTemplateToEdit(null);
      setFormValues(defaultFormState);
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update email template',
        variant: 'destructive',
      });
    },
  });

  // Delete email template mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiRequest('DELETE', `/api/email-templates/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete email template');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates'] });
      
      toast({
        title: 'Template Deleted',
        description: 'The email template has been successfully deleted.',
      });
      
      // Reset state
      setTemplateToDelete(null);
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete email template',
        variant: 'destructive',
      });
    },
  });

  const handleEditClick = (template) => {
    setTemplateToEdit(template);
    setFormValues({
      name: template.name,
      subject: template.subject,
      content: template.content
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (template) => {
    setTemplateToDelete(template);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formValues);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (templateToEdit) {
      updateMutation.mutate({ 
        id: templateToEdit.id, 
        data: formValues 
      });
    }
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete.id);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Mock email templates if none available from the API
  const mockEmailTemplates = [
    {
      id: 1,
      name: "welcome",
      subject: "Welcome to Mechxer!",
      content: "Hello {{username}},\n\nWelcome to Mechxer! We're excited to have you on board.",
      createdAt: "2023-07-15T10:30:00Z",
      updatedAt: "2023-07-15T10:30:00Z"
    },
    {
      id: 2,
      name: "subscription_confirmation",
      subject: "Your Subscription Confirmation",
      content: "Hello {{username}},\n\nThank you for subscribing to {{productName}}. Your subscription is now active.",
      createdAt: "2023-08-05T14:20:00Z",
      updatedAt: "2023-08-05T14:20:00Z"
    },
    {
      id: 3,
      name: "subscription_expiry",
      subject: "Your Subscription is About to Expire",
      content: "Hello {{username}},\n\nYour subscription to {{productName}} will expire on {{expiryDate}}.",
      createdAt: "2023-09-10T09:45:00Z",
      updatedAt: "2023-09-10T09:45:00Z"
    }
  ];

  const templatesData = templates || mockEmailTemplates;

  if (isLoading) {
    return <EmailTemplatesManagementSkeleton />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-2 xl:space-y-0 xl:flex-row items-start xl:items-center justify-between">
            <div>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Manage email templates for system notifications
              </CardDescription>
            </div>
            <Button onClick={() => {
              setFormValues(defaultFormState);
              setCreateDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {templatesData.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-border rounded-md">
                <Mail className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-1">No Email Templates Found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first email template to get started.
                </p>
                <Button onClick={() => {
                  setFormValues(defaultFormState);
                  setCreateDialogOpen(true);
                }}>
                  Create Template
                </Button>
              </div>
            ) : (
              templatesData.map((template) => (
                <div key={template.id} className="border border-border rounded-md p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
                    <div>
                      <h3 className="font-medium text-lg">{template.name}</h3>
                      <p className="text-muted-foreground">{template.subject}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(template)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(template)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Template Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
            <DialogDescription>
              Create a new email template for system notifications.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name</Label>
                <Input 
                  id="name"
                  name="name"
                  placeholder="e.g., welcome, password_reset"
                  value={formValues.name}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Template name should be unique and lowercase with underscores.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input 
                  id="subject"
                  name="subject"
                  placeholder="Email subject line"
                  value={formValues.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="content">Email Body</Label>
                <Textarea 
                  id="content"
                  name="content"
                  placeholder="Email content with {{placeholders}}"
                  value={formValues.content}
                  onChange={handleInputChange}
                  rows={8}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  You can use placeholders like {{username}}, {{productName}}, etc.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>
              Make changes to the email template.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Template Name</Label>
                <Input 
                  id="edit-name"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  required
                  disabled
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-subject">Email Subject</Label>
                <Input 
                  id="edit-subject"
                  name="subject"
                  value={formValues.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-content">Email Body</Label>
                <Textarea 
                  id="edit-content"
                  name="content"
                  value={formValues.content}
                  onChange={handleInputChange}
                  rows={8}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  You can use placeholders like {{username}}, {{productName}}, etc.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Template Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              <span className="font-medium"> {templateToDelete?.name}</span> email template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}