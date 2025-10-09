import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  Tag,
  BookOpen,
  Video,
  Save,
  X
} from "lucide-react";
import { BlogService, BlogPost, VideoContent } from "@/services/BlogService";
import { toast } from "@/hooks/use-toast";

const BlogManagement = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoContent | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<'blog' | 'video'>('blog');

  const categories = [
    'donation',
    'transplant',
    'awareness',
    'success-stories',
    'medical',
    'technology',
    'community'
  ];

  const statusOptions = [
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' }
  ];

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const [blogData, videoData] = await Promise.all([
        BlogService.getBlogPosts({ limit: 50 }),
        BlogService.getVideos({ limit: 50 })
      ]);
      setBlogs(blogData);
      setVideos(videoData);
    } catch (error) {
      console.error('Error loading content:', error);
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlog = async (formData: FormData) => {
    const blogData = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      excerpt: formData.get('excerpt') as string,
      author: formData.get('author') as string,
      category: formData.get('category') as string,
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean),
      read_time: parseInt(formData.get('read_time') as string) || 5,
      featured: formData.get('featured') === 'on',
      status: formData.get('status') as 'published' | 'draft' | 'archived',
      image_url: formData.get('image_url') as string || undefined,
      views: 0
    };

    try {
      const newBlog = await BlogService.createBlogPost(blogData);
      if (newBlog) {
        setBlogs(prev => [newBlog, ...prev]);
        setIsCreateDialogOpen(false);
        toast({
          title: "Success",
          description: "Blog post created successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create blog post",
        variant: "destructive"
      });
    }
  };

  const handleCreateVideo = async (formData: FormData) => {
    const videoData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      url: formData.get('url') as string,
      thumbnail: formData.get('thumbnail') as string,
      duration: formData.get('duration') as string,
      category: formData.get('category') as string,
      author: formData.get('author') as string,
      featured: formData.get('featured') === 'on',
      status: formData.get('status') as 'published' | 'draft' | 'archived',
      views: 0
    };

    try {
      const newVideo = await BlogService.createVideo(videoData);
      if (newVideo) {
        setVideos(prev => [newVideo, ...prev]);
        setIsCreateDialogOpen(false);
        toast({
          title: "Success",
          description: "Video created successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create video",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBlog = async (id: string) => {
    try {
      const success = await BlogService.deleteBlogPost(id);
      if (success) {
        setBlogs(prev => prev.filter(blog => blog.id !== id));
        toast({
          title: "Success",
          description: "Blog post deleted successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive"
      });
    }
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      const success = await BlogService.deleteVideo(id);
      if (success) {
        setVideos(prev => prev.filter(video => video.id !== id));
        toast({
          title: "Success",
          description: "Video deleted successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Content Management</h2>
          <p className="text-gray-600 mt-1">
            Manage blog posts and videos for the awareness section
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setCreateType('blog')}>
                <Plus className="w-4 h-4 mr-2" />
                New Blog Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Blog Post</DialogTitle>
                <DialogDescription>
                  Add a new blog post to the awareness section
                </DialogDescription>
              </DialogHeader>
              <form action={handleCreateBlog} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input name="title" required />
                  </div>
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input name="author" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea name="excerpt" rows={2} required />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea name="content" rows={8} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.replace('-', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue="draft">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input name="tags" placeholder="organ donation, transplant, awareness" />
                  </div>
                  <div>
                    <Label htmlFor="read_time">Read Time (minutes)</Label>
                    <Input name="read_time" type="number" defaultValue="5" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="image_url">Image URL (optional)</Label>
                  <Input name="image_url" placeholder="https://..." />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch name="featured" />
                  <Label htmlFor="featured">Featured Post</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setCreateType('video')}>
                <Plus className="w-4 h-4 mr-2" />
                New Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Video</DialogTitle>
                <DialogDescription>
                  Add a new video to the awareness section
                </DialogDescription>
              </DialogHeader>
              <form action={handleCreateVideo} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input name="title" required />
                  </div>
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input name="author" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea name="description" rows={3} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="url">Video URL</Label>
                    <Input name="url" required placeholder="https://www.youtube.com/watch?v=..." />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input name="duration" placeholder="12:34" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.replace('-', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue="draft">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
                  <Input name="thumbnail" placeholder="https://..." />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch name="featured" />
                  <Label htmlFor="featured">Featured Video</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Create Video
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="blogs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="blogs" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Blog Posts ({blogs.length})</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center space-x-2">
            <Video className="w-4 h-4" />
            <span>Videos ({videos.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blogs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogs.map((blog) => (
              <Card key={blog.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    {getStatusBadge(blog.status)}
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">{blog.views}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{blog.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{blog.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{blog.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{new Date(blog.published_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline" className="text-xs">
                      {blog.category.replace('-', ' ')}
                    </Badge>
                    <span className="text-xs text-gray-500">{blog.read_time} min read</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {blog.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <Card key={video.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    {getStatusBadge(video.status)}
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">{video.views}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{video.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{video.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{new Date(video.published_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline" className="text-xs">
                      {video.category.replace('-', ' ')}
                    </Badge>
                    <span className="text-xs text-gray-500">{video.duration}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteVideo(video.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogManagement;
