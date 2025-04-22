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
import { Badge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Globe,
  Eye,
  Save
} from 'lucide-react';

export function ContentPagesSkeleton() {
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
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ContentPages() {
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
        throw new Error(error.message || 'Failed to create page');
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
        description: error.message || 'Failed to create page',
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
        throw new Error(error.message || 'Failed to update page');
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
        description: error.message || 'Failed to update page',
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
        throw new Error(error.message || 'Failed to delete page');
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
        description: error.message || 'Failed to delete page',
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

  // Mock pages if none available from the API
  const mockContentPages = [
    {
      id: 1,
      title: "About Us",
      slug: "about",
      content: "<h1>About Mechxer</h1><p>Mechxer is a premium software subscription marketplace offering high-quality software solutions for professionals and businesses.</p>",
      isPublished: true,
      createdAt: "2023-05-15T10:30:00Z",
      updatedAt: "2023-05-15T10:30:00Z"
    },
    {
      id: 2,
      title: "Privacy Policy",
      slug: "privacy",
      content: "<h1>Privacy Policy</h1><p>At Mechxer, we take your privacy seriously...</p>",
      isPublished: true,
      createdAt: "2023-06-10T14:20:00Z",
      updatedAt: "2023-06-10T14:20:00Z"
    },
    {
      id: 3,
      title: "Terms & Conditions",
      slug: "terms",
      content: "<h1>Terms & Conditions</h1><p>By using Mechxer, you agree to the following terms...</p>",
      isPublished: true,
      createdAt: "2023-06-15T09:45:00Z",
      updatedAt: "2023-06-15T09:45:00Z"
    }
  ];

  const displayPages = pages?.length > 0 ? pages : mockContentPages;

  if (isLoading) {
    return <ContentPagesSkeleton />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-2 xl:space-y-0 xl:flex-row items-start xl:items-center justify-between">
            <div>
              <CardTitle>Content Pages</CardTitle>
              <CardDescription>
                Manage website content pages such as About Us, Privacy Policy, etc.
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
            {displayPages.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-border rounded-md">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-1">No Content Pages</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first content page to get started
                </p>
                <Button onClick={() => {
                  setFormValues(defaultFormState);
                  setCreateDialogOpen(true);
                }}>
                  Create Page
                </Button>
              </div>
            ) : (
              displayPages.map((page) => (
                <div key={page.id} className="border border-border rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="font-medium">{page.title}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={page.isPublished ? "success" : "secondary"}>
                        {page.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </a>
                        </Button>
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
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Globe className="h-4 w-4 mr-1" />
                    <span>/{page.slug}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last updated: {formatDate(page.updatedAt, 'long')}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Page Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Content Page</DialogTitle>
            <DialogDescription>
              Add a new page to your website
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="About Us"
                  value={formValues.title}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    if (!formValues.slug && e.target.value) {
                      generateSlug(e.target.value);
                    }
                  }}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-1">/</span>
                  <Input
                    id="slug"
                    name="slug"
                    placeholder="about-us"
                    value={formValues.slug}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This will be the URL path for your page
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Page Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="<h1>About Us</h1><p>Your content here...</p>"
                  rows={10}
                  value={formValues.content}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  HTML content for the page. You can use tags like &lt;h1&gt;, &lt;p&gt;, &lt;ul&gt;, etc.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  checked={formValues.isPublished}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="isPublished">Publish page</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Page
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Page Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Content Page</DialogTitle>
            <DialogDescription>
              Make changes to the content page
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Page Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={formValues.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-slug">URL Slug</Label>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-1">/</span>
                  <Input
                    id="edit-slug"
                    name="slug"
                    value={formValues.slug}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-content">Page Content</Label>
                <Textarea
                  id="edit-content"
                  name="content"
                  rows={10}
                  value={formValues.content}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isPublished"
                  checked={formValues.isPublished}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="edit-isPublished">Publish page</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>Updating...</>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the "{pageToDelete?.title}" page. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
