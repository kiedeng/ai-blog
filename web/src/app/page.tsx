'use client';

import { useState } from 'react';
import Link from "next/link";
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';

// 图片缓存
const imageCache = new Map<string, string>();

// 智能图片主题选择函数
const getImageTheme = (title: string, excerpt: string = '') => {
  const content = (title + ' ' + excerpt).toLowerCase();
  
  // 关键词映射到图片主题
  const themeKeywords = {
    'nature': ['自然', '风景', '山水', '森林', '树木', '花朵', '植物', 'nature', 'landscape', 'forest', 'tree', 'flower'],
    'technology': ['技术', '科技', '编程', '代码', '电脑', '手机', '互联网', 'ai', 'tech', 'code', 'programming', 'computer', 'digital'],
    'business': ['商业', '企业', '管理', '营销', '创业', '投资', 'business', 'marketing', 'startup', 'finance', 'management'],
    'design': ['设计', '艺术', '创意', '美学', '视觉', 'design', 'art', 'creative', 'aesthetic', 'visual', 'beauty'],
    'city': ['城市', '建筑', '都市', '高楼', '街道', 'city', 'urban', 'building', 'architecture', 'skyline', 'street'],
    'abstract': ['抽象', '几何', '色彩', '抽象', 'abstract', 'geometric', 'color', 'pattern', 'minimalist'],
    'ocean': ['海洋', '海滩', '波浪', '蓝色', 'ocean', 'sea', 'beach', 'wave', 'blue', 'water'],
    'mountains': ['山', '山峰', '登山', '高原', 'mountain', 'peak', 'hiking', 'alpine', 'summit'],
    'sky': ['天空', '云朵', '星空', '日出', '日落', 'sky', 'cloud', 'star', 'sunrise', 'sunset'],
    'vintage': ['复古', '怀旧', '经典', '传统', 'vintage', 'retro', 'classic', 'traditional', 'old']
  };
  
  // 查找匹配的主题
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      return theme;
    }
  }
  
  // 默认主题
  return 'abstract';
};

// 随机图片生成函数
const getRandomImage = (title: string, width: number = 400, height: number = 300, excerpt: string = '') => {
  const cacheKey = `${title}-${width}-${height}`;
  
  // 检查缓存
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }
  
  // 使用标题生成种子，确保同一篇文章总是显示相同的图片
  const seed = title.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // 智能选择主题
  const theme = getImageTheme(title, excerpt);
  const imageId = Math.abs(seed) % 1000;
  
  // 开发环境下显示选择的主题（可选）
  if (process.env.NODE_ENV === 'development') {
    console.log(`为文章 "${title}" 选择图片主题: ${theme}`);
  }
  
  // 使用多个可靠的图片源
  const imageSources = [
    // Picsum Photos - 最可靠的免费图片服务
    `https://picsum.photos/${width}/${height}?random=${imageId}`,
    // Unsplash Source API - 根据主题选择
    `https://source.unsplash.com/${width}x${height}/?${theme}&sig=${Math.abs(seed)}`,
    // 备用：使用固定的高质量图片
    `https://images.unsplash.com/photo-${1500000000000 + imageId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=${width}&q=80`
  ];
  
  // 根据种子选择图片源
  const sourceIndex = Math.abs(seed) % imageSources.length;
  const imageUrl = imageSources[sourceIndex];
  
  // 缓存图片URL
  imageCache.set(cacheKey, imageUrl);
  
  return imageUrl;
};

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const { posts, loading, error } = usePosts({ 
    status: 'published',
    per_page: 10 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // 预加载图片
  const preloadImage = (src: string) => {
    if (loadedImages.has(src)) return;
    
    const img = new Image();
    img.onload = () => {
      setLoadedImages(prev => new Set(prev).add(src));
    };
    img.src = src;
  };


  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 导航栏 */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI博客
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/admin"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    管理
                  </Link>
                  <Link
                    href="/write"
                    className="btn-hover bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    ✍️ 写文章
                  </Link>
                  <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200 dark:border-gray-600">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {(user?.display_name || user?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.display_name || user?.username}
                      </span>
                      <button
                        onClick={logout}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        退出登录
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="btn-hover bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  🔑 登录
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索栏 */}
        <div className="mb-12">
          <div className="max-w-lg mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="搜索文章标题或内容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white shadow-sm hover:shadow-md transition-all duration-200 text-lg placeholder-gray-400 dark:placeholder-gray-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                找到 {filteredPosts.length} 篇文章
              </p>
            )}
          </div>
        </div>

        {/* 文章列表 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="loading-spinner mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">加载文章失败: {error}</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="empty-state">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {searchTerm ? '没有找到相关文章' : '暂无文章'}
            </p>
            {!searchTerm && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                开始写第一篇文章吧！
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPosts.map((post, index) => (
              <article
                key={post.id}
                className="group article-card bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:scale-[1.02] hover:-translate-y-1"
                style={{ '--index': index } as React.CSSProperties}
              >
                {/* 封面图片区域 */}
                <div className="relative overflow-hidden">
                  {/* 图片加载指示器 */}
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center z-10">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  
                  <img
                    src={post.cover_image || getRandomImage(post.title, 400, 300, post.excerpt)}
                    alt={post.title}
                    className="article-image w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onLoad={(e) => {
                      // 图片加载完成后隐藏加载指示器
                      const target = e.target as HTMLImageElement;
                      const loader = target.previousElementSibling as HTMLElement;
                      if (loader) {
                        loader.style.display = 'none';
                      }
                      // 预加载下一张图片
                      const nextPost = filteredPosts[filteredPosts.indexOf(post) + 1];
                      if (nextPost) {
                        preloadImage(getRandomImage(nextPost.title, 400, 300, nextPost.excerpt));
                      }
                    }}
                    onError={(e) => {
                      // 如果图片加载失败，使用备用图片
                      const target = e.target as HTMLImageElement;
                      const loader = target.previousElementSibling as HTMLElement;
                      
                      if (!target.dataset.retry) {
                        target.dataset.retry = 'true';
                        const backupSrc = getRandomImage(post.title + '_backup', 400, 300, post.excerpt);
                        target.src = backupSrc;
                        preloadImage(backupSrc);
                      } else {
                        // 如果备用图片也失败，显示默认占位符
                        target.style.display = 'none';
                        if (loader) {
                          loader.style.display = 'none';
                        }
                        const placeholder = target.nextElementSibling as HTMLElement;
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }
                    }}
                  />
                  
                  {/* 图片加载失败时的占位符 */}
                  <div className="hidden w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                        <span className="text-2xl">📝</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">AI博客</p>
                    </div>
                  </div>
                  
                  {/* 分类标签 - 覆盖在图片上 */}
                  {post.category && (
                    <div className="absolute top-3 left-3">
                      <span className="category-tag inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 backdrop-blur-sm shadow-sm">
                        {post.category.name}
                      </span>
                    </div>
                  )}
                  
                  {/* 渐变遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* 内容区域 */}
                <div className="p-5">
                  {/* 日期 */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {new Date(post.created_at).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <span>👁️</span>
                      <span>{post.view_count || 0}</span>
                    </div>
                  </div>
                  
                  {/* 标题 */}
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <Link 
                      href={`/posts/${post.slug}`}
                      className="hover:no-underline"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  
                  {/* 摘要 */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  {/* 底部操作区 */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1 stat-number">
                        <span>❤️</span>
                        <span>{post.like_count || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1 stat-number">
                        <span>💬</span>
                        <span>{post.comment_count || 0}</span>
                      </div>
                    </div>
                    
                    <Link
                      href={`/posts/${post.slug}`}
                      className="btn-hover inline-flex items-center px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 hover:scale-105"
                    >
                      阅读更多
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}