'use client';

import { useMemo, useEffect } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

// macOS风格代码窗格创建函数 - 优化版本
function createMacOSCodeWindow(language: string, code: string): string {
  return `
    <div class="editor-mockup">
      <div class="editor-bar">
        <div class="dots">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
        </div>
        <div class="lang">${language.toUpperCase()}</div>
        <button class="copy-btn" aria-label="复制代码" title="复制代码">复制</button>
      </div>
      <pre class="code-block" data-lang="${language}"><code class="language-${language}">${code}</code></pre>
    </div>
  `;
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const processor = useMemo(() => {
    return unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeHighlight, { 
        detect: true,
        ignoreMissing: true,
        subset: false
      } as any)
      .use(rehypeKatex, {
        strict: false,
        throwOnError: false,
        errorColor: '#cc0000'
      })
      .use(rehypeStringify);
  }, []);

  const processedContent = useMemo(() => {
    try {
      const result = processor.processSync(content);
      let html = result.toString();
      
      console.log('原始HTML:', html);
      
      // macOS风格代码窗格渲染 - 标准版本
      // 处理 highlight.js 处理过的代码块（带 hljs 类，没有 pre class）
      html = html.replace(/<pre><code class="hljs language-(\w+)"[^>]*>([\s\S]*?)<\/code><\/pre>/g, (match, lang, code) => {
        return createMacOSCodeWindow(lang, code);
      });
      
      // 处理 highlight.js 处理过的代码块（带 hljs 类，有 pre class）
      html = html.replace(/<pre class="[^"]*"><code class="hljs language-(\w+)"[^>]*>([\s\S]*?)<\/code><\/pre>/g, (match, lang, code) => {
        return createMacOSCodeWindow(lang, code);
      });
      
      // 处理 highlight.js 处理过的代码块（带 animate-fade-in-up 类）
      html = html.replace(/<pre class="[^"]*animate-fade-in-up[^"]*"><code class="hljs language-(\w+)"[^>]*>([\s\S]*?)<\/code><\/pre>/g, (match, lang, code) => {
        return createMacOSCodeWindow(lang, code);
      });
      
      // 处理有语言标识的代码块
      html = html.replace(/<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g, (match, lang, code) => {
        return createMacOSCodeWindow(lang, code);
      });
      
      // 处理没有语言标识的代码块
      html = html.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (match, code) => {
        return createMacOSCodeWindow('text', code);
      });
      
      // 处理可能被highlight.js处理过的代码块
      html = html.replace(/<pre class="language-(\w+)"><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g, (match, preClass, codeClass, code) => {
        return createMacOSCodeWindow(codeClass, code);
      });
      
      console.log('处理后的HTML:', html);
      return html;
    } catch (error) {
      console.error('Markdown processing error:', error);
      return '<div class="error">Markdown渲染错误</div>';
    }
  }, [content, processor]);

  // 添加动画效果和复制功能
  useEffect(() => {
    // 延迟执行，确保DOM已经渲染
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.markdown-content-enhanced > *');
      
      // 立即显示所有元素
      elements.forEach((el) => {
        el.classList.add('animate-fade-in-up');
      });

      // 设置观察器用于滚动动画
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-fade-in-up');
            }
          });
        },
        { threshold: 0.1 }
      );

      elements.forEach((el) => {
        observer.observe(el);
      });

      // 添加macOS风格代码窗格的复制功能
      const editorMockups = document.querySelectorAll('.editor-mockup');
      editorMockups.forEach((container) => {
        const btn = container.querySelector('.copy-btn') as HTMLButtonElement;
        const pre = container.querySelector('.code-block') as HTMLElement;
        
        if (!btn || !pre) return;
        
        btn.addEventListener('click', async (e) => {
          e.stopPropagation(); // 防止事件冒泡
          
          try {
            await navigator.clipboard.writeText(pre.innerText.trim());
            btn.textContent = '已复制';
            btn.classList.add('copied');
            setTimeout(() => {
              btn.textContent = '复制';
              btn.classList.remove('copied');
            }, 1400);
          } catch (e) {
            btn.textContent = '复制失败';
            setTimeout(() => {
              btn.textContent = '复制';
            }, 1400);
          }
        });
      });

      return () => {
        elements.forEach((el) => {
          observer.unobserve(el);
        });
      };
    }, 50);

    return () => clearTimeout(timer);
  }, [processedContent]);

  return (
    <div 
      className={`markdown-content-enhanced ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
