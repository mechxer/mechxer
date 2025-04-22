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
import { Switch } from '@/components/ui/switch';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Save,
  Eye
} from 'lucide-react';

export function ContentManagementSkeleton() {
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ContentManagement() {
  const [pageToEdit, setPageToEdit] = useState(null);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Create default form state
  const defaultFormState = {
    title: '',
    slug: '',
    content: '',
    isPublished: true
  };
  
  const [formValues, setFormValues] = useState(defaultFormState);
  
  // Fetch content pages
  const { 
    data: pages, 
    isLoading 
  } = useQuery({
    queryKey: ['/api/content-pages'],
  });

  // Create content page mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/content-pages', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create content page');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/content-pages'] });
      
      toast({
        title: 'Page Created',
        description: 'The content page has been successfully created.',
      });
      
      // Reset form and close dialog
      setFormValues(defaultFormState);
      setCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create content page',
        variant: 'destructive',
      });
    },
  });

  // Update content page mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest('PATCH', `/api/content-pages/${id}`, data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update content page');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/content-pages'] });
      
      toast({
        title: 'Page Updated',
        description: 'The content page has been successfully updated.',
      });
      
      // Reset state and close dialog
      setPageToEdit(null);
      setFormValues(defaultFormState);
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update content page',
        variant: 'destructive',
      });
    },
  });

  // Delete content page mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiRequest('DELETE', `/api/content-pages/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete content page');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/content-pages'] });
      
      toast({
        title: 'Page Deleted',
        description: 'The content page has been successfully deleted.',
      });
      
      // Reset state
      setPageToDelete(null);
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete content page',
        variant: 'destructive',
      });
    },
  });

  const handleEditClick = (page) => {
    setPageToEdit(page);
    setFormValues({
      title: page.title,
      slug: page.slug,
      content: page.content,
      isPublished: page.isPublished
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (page) => {
    setPageToDelete(page);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formValues);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (pageToEdit) {
      updateMutation.mutate({ 
        id: pageToEdit.id, 
        data: formValues 
      });
    }
  };

  const confirmDelete = () => {
    if (pageToDelete) {
      deleteMutation.mutate(pageToDelete.id);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSwitchChange = (checked) => {
    setFormValues(prev => ({
      ...prev,
      isPublished: checked
    }));
  };

  // Generate slug from title
  const generateSlug = (title) => {
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    setFormValues(prev => ({
      ...prev,
      slug
    }));
  };

  // Mock content pages if none available from the API
  const mockContentPages = [
    {
      id: 1,
      title: "About Us",
      slug: "about",
      content: "<h1>About Mechxer</h1><p>Mechxer is a premium software subscription marketplace offering high-quality software solutions for professionals and businesses.</p>",
      isPublished: true,
      createdAt: "2023-07-15T10:30:00Z",
      updatedAt: "2023-07-15T10:30:00Z"
    },
    {
      id: 2,
      title: "Privacy Policy",
      slug: "privacy",
      content: "<h1>Privacy Policy</h1><p>At Mechxer, we take your privacy seriously...</p>",
      isPublished: true,
      createdAt: "2023-07-16T14:20:00Z",
      updatedAt: "2023-07-16T14:20:00Z"
    },
    {
      id: 3,
      title: "Terms & Conditions",
      slug: "terms",
      content: "<h1>Terms & Conditions</h1><p>By using Mechxer, you agree to the following terms...</p>",
      isPublished: true,
      createdAt: "2023-07-17T09:45:00Z",
      updatedAt: "2023-07-17T09:45:00Z"
    },
    {
      id: 4,
      title: "DMCA",
      slug: "dmca",
      content: "<h1>DMCA Policy</h1><p>Mechxer respects the intellectual property rights of others...</p>",
      isPublished: true,
      createdAt: "2023-07-18T11:30:00Z",
      updatedAt: "2023-07-18T11:30:00Z"
    },
    {
      id: 5,
      title: "Contact Us",
      slug: "contact",
      content: "<h1>Contact Us</h1><p>Have questions? We're here to help...</p>",
      isPublished: true,
      createdAt: "2023-07-19T15:45:00Z",
      updatedAt: "2023-07-19T15:45:00Z"
    }
  ];

  const pagesData = pages || mockContentPages;

  if (isLoading) {
    return <ContentManagementSkeleton />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-2 xl:space-y-0 xl:flex-row items-start xl:items-center justify-between">
            <div>
              <CardTitle>Content Pages</CardTitle>
              <CardDescription>
                Manage static content pages
              </CardDescription>
            </div>
            <Button onClick={() => {
              setFormValues(defaultFormState);
              setCreateDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              New Page
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {pagesData.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-border rounded-md">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-1">No Content Pages Found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first content page to get started.
                </p>
                <Button onClick={() => {
                  setFormValues(defaultFormState);
                  setCreateDialogOpen(true);
                }}>
                  Create Page
                </Button>
              </div>
            ) : (
              pagesData.map((page) => (
                <div key={page.id} className="border border-border rounded-md p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
                    <div>
                      <h3 className="font-medium text-lg">{page.title}</h3>
                      <p className="text-sm text-muted-foreground">{`/${page.slug}`}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={page.isPublished ? "success" : "secondary"}>
                        {page.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        {page.isPublished && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(page)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(page)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Page Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Create Content Page</DialogTitle>
            <DialogDescription>
              Create a new static content page.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="title">Page Title</Label>
                  <Input 
                    id="title"
                    name="title"
                    placeholder="About Us"
                    value={formValues.title}
                    onChange={handleInputChange}
                    onBlur={() => {
                      if (formValues.title && !formValues.slug) {
                        generateSlug(formValues.title);
                      }
                    }}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="slug">Page Slug</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      /
                    </span>
                    <Input 
                      id="slug"
                      name="slug"
                      placeholder="about"
                      value={formValues.slug}
                      onChange={handleInputChange}
                      className="rounded-l-none"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The URL path for this page (e.g., /about)
                  </p>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="content">Page Content</Label>
                <Textarea 
                  id="content"
                  name="content"
                  placeholder="<h1>Title</h1><p>Your content here...</p>"
                  value={formValues.content}
                  onChange={handleInputChange}
                  rows={12}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Content supports HTML for formatting
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  name="isPublished"
                  checked={formValues.isPublished}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="isPublished">Publish this page</Label>
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
                {createMutation.isPending ? 'Creating...' : 'Create Page'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Page Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Content Page</DialogTitle>
            <DialogDescription>
              Make changes to the content page.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Page Title</Label>
                  <Input 
                    id="edit-title"
                    name="title"
                    value={formValues.title}
                    onChange={handleInputChange}
                    onBlur={() => {
                      if (formValues.title && !formValues.slug) {
                        generateSlug(formValues.title);
                      }
                    }}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-slug">Page Slug</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      /
                    </span>
                    <Input 
                      id="edit-slug"
                      name="slug"
                      value={formValues.slug}
                      onChange={handleInputChange}
                      className="rounded-l-none"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-content">Page Content</Label>
                <Textarea 
                  id="edit-content"
                  name="content"
                  value={formValues.content}
                  onChange={handleInputChange}
                  rows={12}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isPublished"
                  name="isPublished"
                  checked={formValues.isPublished}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="edit-isPublished">Publish this page</Label>
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

      {/* Delete Page Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              <span className="font-medium"> {pageToDelete?.title}</span> page.
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