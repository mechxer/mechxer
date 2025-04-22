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
  Eye,
  Calendar,
  User
} from 'lucide-react';

export function BlogManagementSkeleton() {
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
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BlogManagement() {
  const [postToEdit, setPostToEdit] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Create default form state
  const defaultFormState = {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    isPublished: true
  };
  
  const [formValues, setFormValues] = useState(defaultFormState);
  
  // Fetch blog posts
  const { 
    data: posts, 
    isLoading 
  } = useQuery({
    queryKey: ['/api/blog-posts'],
  });

  // Create blog post mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/blog-posts', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create blog post');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
      
      toast({
        title: 'Post Created',
        description: 'The blog post has been successfully created.',
      });
      
      // Reset form and close dialog
      setFormValues(defaultFormState);
      setCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create blog post',
        variant: 'destructive',
      });
    },
  });

  // Update blog post mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest('PATCH', `/api/blog-posts/${id}`, data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update blog post');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
      
      toast({
        title: 'Post Updated',
        description: 'The blog post has been successfully updated.',
      });
      
      // Reset state and close dialog
      setPostToEdit(null);
      setFormValues(defaultFormState);
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update blog post',
        variant: 'destructive',
      });
    },
  });

  // Delete blog post mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiRequest('DELETE', `/api/blog-posts/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete blog post');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
      
      toast({
        title: 'Post Deleted',
        description: 'The blog post has been successfully deleted.',
      });
      
      // Reset state
      setPostToDelete(null);
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete blog post',
        variant: 'destructive',
      });
    },
  });

  const handleEditClick = (post) => {
    setPostToEdit(post);
    setFormValues({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage || '',
      isPublished: post.isPublished
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    // Add authorId from current user - in a real app this would come from auth context
    const postData = {
      ...formValues,
      authorId: 1 // Default to admin user for demo
    };
    
    if (formValues.isPublished) {
      postData.publishedAt = new Date().toISOString();
    }
    
    createMutation.mutate(postData);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (postToEdit) {
      const postData = { ...formValues };
      
      // Update publishedAt if publishing for the first time
      if (formValues.isPublished && !postToEdit.publishedAt) {
        postData.publishedAt = new Date().toISOString();
      }
      
      // Set publishedAt to null if unpublishing
      if (!formValues.isPublished && postToEdit.publishedAt) {
        postData.publishedAt = null;
      }
      
      updateMutation.mutate({ 
        id: postToEdit.id, 
        data: postData 
      });
    }
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deleteMutation.mutate(postToDelete.id);
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not published';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      isPublished: false,
      publishedAt: null,
      createdAt: "2023-07-25T09:45:00Z",
      updatedAt: "2023-07-25T09:45:00Z"
    }
  ];

  const postsData = posts || mockBlogPosts;

  if (isLoading) {
    return <BlogManagementSkeleton />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-2 xl:space-y-0 xl:flex-row items-start xl:items-center justify-between">
            <div>
              <CardTitle>Blog Posts</CardTitle>
              <CardDescription>
                Manage blog content for the website
              </CardDescription>
            </div>
            <Button onClick={() => {
              setFormValues(defaultFormState);
              setCreateDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {postsData.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-border rounded-md">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-1">No Blog Posts Found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first blog post to get started.
                </p>
                <Button onClick={() => {
                  setFormValues(defaultFormState);
                  setCreateDialogOpen(true);
                }}>
                  Create Post
                </Button>
              </div>
            ) : (
              postsData.map((post) => (
                <div key={post.id} className="border border-border rounded-md p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
                    <div>
                      <h3 className="font-medium text-lg">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">{`/blog/${post.slug}`}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={post.isPublished ? "success" : "secondary"}>
                        {post.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        {post.isPublished && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(post)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(post)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mb-3">{post.excerpt}</p>
                  <div className="flex flex-col xs:flex-row justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {post.isPublished ? `Published: ${formatDate(post.publishedAt)}` : 'Not published'}
                    </div>
                    <div className="flex items-center mt-1 xs:mt-0">
                      <User className="h-3 w-3 mr-1" />
                      {post.authorName || `Author ID: ${post.authorId}`}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Post Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Create Blog Post</DialogTitle>
            <DialogDescription>
              Create a new blog post.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="title">Post Title</Label>
                  <Input 
                    id="title"
                    name="title"
                    placeholder="Your blog post title"
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
                  <Label htmlFor="slug">URL Slug</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      /blog/
                    </span>
                    <Input 
                      id="slug"
                      name="slug"
                      placeholder="post-url-slug"
                      value={formValues.slug}
                      onChange={handleInputChange}
                      className="rounded-l-none"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The URL path for this post (e.g., /blog/post-url-slug)
                  </p>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="excerpt">Post Excerpt</Label>
                <Textarea 
                  id="excerpt"
                  name="excerpt"
                  placeholder="A brief summary of your post (displayed in blog listings)"
                  value={formValues.excerpt}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Keep it brief, ideally under 160 characters
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <Input 
                  id="featuredImage"
                  name="featuredImage"
                  placeholder="https://example.com/image.jpg"
                  value={formValues.featuredImage}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="content">Post Content</Label>
                <Textarea 
                  id="content"
                  name="content"
                  placeholder="Write your blog post content here..."
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
                <Label htmlFor="isPublished">Publish immediately</Label>
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
                {createMutation.isPending ? 'Creating...' : 'Create Post'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              Make changes to your blog post.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Post Title</Label>
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
                  <Label htmlFor="edit-slug">URL Slug</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      /blog/
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
                <Label htmlFor="edit-excerpt">Post Excerpt</Label>
                <Textarea 
                  id="edit-excerpt"
                  name="excerpt"
                  value={formValues.excerpt}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-featuredImage">Featured Image URL</Label>
                <Input 
                  id="edit-featuredImage"
                  name="featuredImage"
                  value={formValues.featuredImage}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-content">Post Content</Label>
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
                <Label htmlFor="edit-isPublished">
                  {formValues.isPublished ? 'Published' : 'Draft'}
                </Label>
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

      {/* Delete Post Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              <span className="font-medium"> {postToDelete?.title}</span> blog post.
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