'use client';

import { useState, useEffect, useMemo } from 'react';
import apiClient from '@/lib/api';

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  html_content: string;
  excerpt: string;
  status: string;
  is_featured: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;
  author: {
    id: number;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
    color?: string;
  };
}

interface UsePostsOptions {
  page?: number;
  per_page?: number;
  status?: string;
  category_id?: number;
  search?: string;
}

export function usePosts(options: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  // 使用 useMemo 来稳定 options 对象
  const memoizedOptions = useMemo(() => options, [
    options.page, 
    options.per_page, 
    options.status, 
    options.category_id, 
    options.search
  ]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching posts with options:', memoizedOptions);
      const response = await apiClient.getPosts(memoizedOptions);
      console.log('Posts response:', response);
      if (response.success) {
        setPosts(response.data.posts);
        setPagination(response.data.pagination);
      } else {
        setError('获取文章列表失败');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [memoizedOptions]);

  return {
    posts,
    loading,
    error,
    pagination,
    refetch: fetchPosts,
  };
}

export function usePost(id: number) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getPost(id);
      if (response.success) {
        setPost(response.data);
      } else {
        setError('获取文章失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  return {
    post,
    loading,
    error,
    refetch: fetchPost,
  };
}

export function useCreatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = async (postData: {
    title: string;
    content: string;
    status?: string;
    is_featured?: boolean;
    tags?: string[];
    meta_title?: string;
    meta_description?: string;
    category_id?: number;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.createPost(postData);
      if (response.success) {
        return response.data;
      } else {
        setError('创建文章失败');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPost,
    loading,
    error,
  };
}

export function useUpdatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePost = async (id: number, postData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.updatePost(id, postData);
      if (response.success) {
        return response.data;
      } else {
        setError('更新文章失败');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    updatePost,
    loading,
    error,
  };
}

export function useDeletePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePost = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.deletePost(id);
      if (response.success) {
        return true;
      } else {
        setError('删除文章失败');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deletePost,
    loading,
    error,
  };
}
