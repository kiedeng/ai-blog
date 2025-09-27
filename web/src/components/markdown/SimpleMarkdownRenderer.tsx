'use client';

import { useMemo } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

interface SimpleMarkdownRendererProps {
  content: string;
  className?: string;
}

export default function SimpleMarkdownRenderer({ content, className = '' }: SimpleMarkdownRendererProps) {
  const processor = useMemo(() => {
    return unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeHighlight, { 
        detect: true,
        ignoreMissing: true,
        subset: false
      })
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
      return result.toString();
    } catch (error) {
      console.error('Markdown processing error:', error);
      return '<div class="error">Markdown渲染错误</div>';
    }
  }, [content, processor]);

  return (
    <div 
      className={`prose prose-lg max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
