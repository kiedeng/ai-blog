'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';
import Link from 'next/link';

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

export default function PostDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, isAuthenticated } = useAuth();
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.getPostBySlug(slug);
        if (response.success) {
          setPost(response.data);
        } else {
          setError('文章不存在');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('加载文章失败');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error}
          </h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            文章不存在
          </h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 导航栏 */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
                AI博客
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/admin"
                    className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    管理
                  </Link>
                  <Link
                    href="/write"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    写文章
                  </Link>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {user?.display_name || user?.username}
                  </span>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  登录
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 文章内容 */}
      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-6 mb-4 sm:mb-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {post.author.display_name?.charAt(0) || post.author.username?.charAt(0) || 'A'}
                </div>
                <span className="font-medium">作者: {post.author.display_name || post.author.username}</span>
              </div>
              <span className="text-gray-500">•</span>
              <span>发布时间: {new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                <span className="text-blue-600 dark:text-blue-400">👁️</span>
                <span className="font-medium">{post.view_count}</span>
              </div>
              <div className="flex items-center space-x-1 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                <span className="text-red-600 dark:text-red-400">❤️</span>
                <span className="font-medium">{post.like_count}</span>
              </div>
              <div className="flex items-center space-x-1 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                <span className="text-green-600 dark:text-green-400">💬</span>
                <span className="font-medium">{post.comment_count}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700 relative overflow-hidden">
          {/* 装饰性背景 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-100 to-yellow-100 dark:from-pink-900/20 dark:to-yellow-900/20 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
          
          <div className="relative z-10">
            <MarkdownRenderer content={post.content || post.html_content || ''} />
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← 返回首页
            </Link>
            
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <Link
                  href={`/posts/${post.slug}/edit`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  编辑文章
                </Link>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  删除文章
                </button>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
