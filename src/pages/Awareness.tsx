import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Calendar, 
  Eye, 
  Play, 
  Heart, 
  Users, 
  BookOpen, 
  Video,
  Filter,
  TrendingUp
} from "lucide-react";
import ReactPlayer from 'react-player';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
  readTime: number;
  views: number;
  imageUrl?: string;
}

interface VideoContent {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: string;
  category: string;
  publishedAt: string;
  views: number;
  author: string;
}

const Awareness = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "donation", label: "Organ Donation" },
    { value: "transplant", label: "Transplant Process" },
    { value: "awareness", label: "Awareness" },
    { value: "success-stories", label: "Success Stories" },
    { value: "medical", label: "Medical Information" }
  ];

  // Mock data - in real app, this would come from your backend
  useEffect(() => {
    const mockBlogs: BlogPost[] = [
      {
        id: "1",
        title: "Understanding Organ Donation: A Complete Guide",
        content: "Organ donation is one of the most impactful ways to save lives...",
        excerpt: "Learn about the organ donation process, eligibility criteria, and how you can make a difference.",
        author: "Dr. Sarah Johnson",
        publishedAt: "2024-01-15",
        category: "donation",
        tags: ["organ donation", "transplant", "medical"],
        readTime: 8,
        views: 1250,
        imageUrl: "/api/placeholder/400/250"
      },
      {
        id: "2",
        title: "The Journey of a Heart Transplant: A Patient's Story",
        content: "My name is Michael, and this is my story of receiving a heart transplant...",
        excerpt: "A personal account of the emotional and physical journey through heart transplantation.",
        author: "Michael Chen",
        publishedAt: "2024-01-10",
        category: "success-stories",
        tags: ["heart transplant", "patient story", "recovery"],
        readTime: 6,
        views: 890,
        imageUrl: "/api/placeholder/400/250"
      },
      {
        id: "3",
        title: "Breaking Myths About Organ Donation",
        content: "There are many misconceptions surrounding organ donation...",
        excerpt: "Debunking common myths and providing accurate information about organ donation.",
        author: "Dr. Emily Rodriguez",
        publishedAt: "2024-01-08",
        category: "awareness",
        tags: ["myths", "facts", "education"],
        readTime: 5,
        views: 2100,
        imageUrl: "/api/placeholder/400/250"
      }
    ];

    const mockVideos: VideoContent[] = [
      {
        id: "1",
        title: "Organ Donation Process Explained",
        description: "A comprehensive overview of how organ donation works from registration to transplant.",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with actual video URL
        thumbnail: "/api/placeholder/400/250",
        duration: "12:34",
        category: "donation",
        publishedAt: "2024-01-12",
        views: 3450,
        author: "TransplantChain Team"
      },
      {
        id: "2",
        title: "Live Organ Matching System",
        description: "See how our blockchain-based system matches organs with patients in real-time.",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with actual video URL
        thumbnail: "/api/placeholder/400/250",
        duration: "8:45",
        category: "transplant",
        publishedAt: "2024-01-09",
        views: 1890,
        author: "Tech Team"
      },
      {
        id: "3",
        title: "Success Stories: Lives Saved Through Organ Donation",
        description: "Heartwarming stories of recipients and their families.",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with actual video URL
        thumbnail: "/api/placeholder/400/250",
        duration: "15:20",
        category: "success-stories",
        publishedAt: "2024-01-05",
        views: 4200,
        author: "Community Team"
      }
    ];

    setBlogs(mockBlogs);
    setVideos(mockVideos);
    setLoading(false);
  }, []);

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Awareness & Education Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn about organ donation, transplantation, and how you can make a difference. 
            Access educational content, success stories, and live updates from our platform.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search articles and videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Live Updates Banner */}
        <Card className="mb-8 bg-gradient-to-r from-green-500 to-blue-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Live Organ Availability</span>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm opacity-90">Critical Hearts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm opacity-90">Kidneys Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-sm opacity-90">Livers Ready</div>
                </div>
                <Button variant="secondary" size="sm">
                  View Live Map
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="blogs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="blogs" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Blogs & Articles</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center space-x-2">
              <Video className="w-4 h-4" />
              <span>Videos & Tutorials</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blogs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <Card key={blog.id} className="group hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {categories.find(c => c.value === blog.category)?.label}
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {blog.views}
                      </span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {blog.title}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {blog.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>{blog.author}</span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(blog.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {blog.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Read Article ({blog.readTime} min read)
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="group hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <div className="relative aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                      <ReactPlayer
                        url={video.url}
                        width="100%"
                        height="100%"
                        light={video.thumbnail}
                        controls={false}
                        className="react-player"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {categories.find(c => c.value === video.category)?.label}
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {video.views}
                      </span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {video.title}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {video.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>{video.author}</span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(video.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Watch Video
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-r from-primary to-secondary text-white border-0">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of people who have registered as organ donors and are saving lives every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg">
                Register as Donor
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Awareness;
