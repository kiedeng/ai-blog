'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCreatePost } from '@/hooks/usePosts';
import SimpleMarkdownEditor from '@/components/editor/SimpleMarkdownEditor';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';
import { useRouter } from 'next/navigation';

export default function WritePage() {
  const { user, isAuthenticated } = useAuth();
  const { createPost, loading: creating } = useCreatePost();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(`# 新文章

在这里开始你的创作...

## 功能特性

- **专业级编辑器**: 基于Monaco Editor
- **实时预览**: 分屏编辑，所见即所得
- **后端保存**: 文章会自动保存到数据库

## 开始写作

你可以在这里开始你的创作之旅！`);
  
  const [status, setStatus] = useState('published');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // 检查登录状态
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // 自动保存到本地存储
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedContent = localStorage.getItem('editor-content');
      if (savedContent) {
        setContent(savedContent);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('editor-content', content);
    }
  }, [content]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('标题和内容不能为空');
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title,
        content,
        status,
        tags: [],
      };

      const result = await createPost(postData);
      if (result) {
        setLastSaved(new Date());
        alert('保存成功！');
        // 清空编辑器
        setTitle('');
        setContent('# 新文章\n\n在这里开始你的创作...');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('editor-content');
        }
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            请先登录
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            您需要登录才能使用编辑器功能
          </p>
          <a
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            去登录
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 工具栏 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              写文章
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'edit'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                编辑
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'preview'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                预览
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'split'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                分屏
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="px-3 py-1 rounded text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {theme === 'light' ? '🌙' : '☀️'} {theme === 'light' ? '暗色' : '亮色'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || creating}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            {lastSaved && (
              <span className="text-sm text-gray-500">
                最后保存: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 标题输入 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入文章标题..."
          className="w-full text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <div className="flex items-center space-x-4 mt-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-1 rounded text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
          >
            <option value="draft">草稿</option>
            <option value="published">发布</option>
            <option value="archived">归档</option>
          </select>
          <span className="text-sm text-gray-500">
            作者: {user?.display_name || user?.username}
          </span>
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="flex" style={{ height: 'calc(100vh - 160px)' }}>
        {/* 编辑器 */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div 
            className="border-r border-gray-200 dark:border-gray-700"
            style={{ width: viewMode === 'split' ? '50%' : '100%' }}
          >
            <SimpleMarkdownEditor
              value={content}
              onChange={setContent}
              height="100%"
              theme={theme}
            />
          </div>
        )}

        {/* 预览区域 */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div 
            className="overflow-auto p-6"
            style={{ width: viewMode === 'split' ? '50%' : '100%' }}
          >
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <h1>{title || '无标题'}</h1>
              <MarkdownRenderer content={content} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
