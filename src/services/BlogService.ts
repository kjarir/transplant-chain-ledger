import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  published_at: string;
  category: string;
  tags: string[];
  read_time: number;
  views: number;
  image_url?: string;
  featured: boolean;
  status: 'published' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface VideoContent {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: string;
  category: string;
  published_at: string;
  views: number;
  author: string;
  featured: boolean;
  status: 'published' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

export class BlogService {
  // Blog Posts
  static async getBlogPosts(filters?: {
    category?: string;
    status?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<BlogPost[]> {
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.featured) {
        query = query.eq('featured', true);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching blog posts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
  }

  static async getBlogPost(id: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) {
        console.error('Error fetching blog post:', error);
        return null;
      }

      // Increment view count
      await this.incrementBlogViews(id);

      return data;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return null;
    }
  }

  static async createBlogPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([post])
        .select()
        .single();

      if (error) {
        console.error('Error creating blog post:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating blog post:', error);
      return null;
    }
  }

  static async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating blog post:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating blog post:', error);
      return null;
    }
  }

  static async deleteBlogPost(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting blog post:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return false;
    }
  }

  static async incrementBlogViews(id: string): Promise<void> {
    try {
      await supabase.rpc('increment_blog_views', { blog_id: id });
    } catch (error) {
      console.error('Error incrementing blog views:', error);
    }
  }

  // Video Content
  static async getVideos(filters?: {
    category?: string;
    status?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<VideoContent[]> {
    try {
      let query = supabase
        .from('video_content')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.featured) {
        query = query.eq('featured', true);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching videos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching videos:', error);
      return [];
    }
  }

  static async getVideo(id: string): Promise<VideoContent | null> {
    try {
      const { data, error } = await supabase
        .from('video_content')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) {
        console.error('Error fetching video:', error);
        return null;
      }

      // Increment view count
      await this.incrementVideoViews(id);

      return data;
    } catch (error) {
      console.error('Error fetching video:', error);
      return null;
    }
  }

  static async createVideo(video: Omit<VideoContent, 'id' | 'created_at' | 'updated_at'>): Promise<VideoContent | null> {
    try {
      const { data, error } = await supabase
        .from('video_content')
        .insert([video])
        .select()
        .single();

      if (error) {
        console.error('Error creating video:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating video:', error);
      return null;
    }
  }

  static async updateVideo(id: string, updates: Partial<VideoContent>): Promise<VideoContent | null> {
    try {
      const { data, error } = await supabase
        .from('video_content')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating video:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating video:', error);
      return null;
    }
  }

  static async deleteVideo(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('video_content')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting video:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting video:', error);
      return false;
    }
  }

  static async incrementVideoViews(id: string): Promise<void> {
    try {
      await supabase.rpc('increment_video_views', { video_id: id });
    } catch (error) {
      console.error('Error incrementing video views:', error);
    }
  }

  // Search functionality
  static async searchContent(query: string, type: 'blog' | 'video' | 'all' = 'all'): Promise<{
    blogs: BlogPost[];
    videos: VideoContent[];
  }> {
    try {
      const results = { blogs: [] as BlogPost[], videos: [] as VideoContent[] };

      if (type === 'blog' || type === 'all') {
        const { data: blogData, error: blogError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'published')
          .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
          .order('published_at', { ascending: false });

        if (!blogError) {
          results.blogs = blogData || [];
        }
      }

      if (type === 'video' || type === 'all') {
        const { data: videoData, error: videoError } = await supabase
          .from('video_content')
          .select('*')
          .eq('status', 'published')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .order('published_at', { ascending: false });

        if (!videoError) {
          results.videos = videoData || [];
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching content:', error);
      return { blogs: [], videos: [] };
    }
  }

  // Categories
  static async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('category')
        .eq('status', 'published')
        .not('category', 'is', null);

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      const categories = [...new Set(data?.map(item => item.category))];
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Featured content
  static async getFeaturedContent(): Promise<{
    blogs: BlogPost[];
    videos: VideoContent[];
  }> {
    try {
      const [blogs, videos] = await Promise.all([
        this.getBlogPosts({ featured: true, limit: 3 }),
        this.getVideos({ featured: true, limit: 3 })
      ]);

      return { blogs, videos };
    } catch (error) {
      console.error('Error fetching featured content:', error);
      return { blogs: [], videos: [] };
    }
  }
}
