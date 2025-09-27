'use client';

import { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';

interface SimpleMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  theme?: 'light' | 'dark';
  readOnly?: boolean;
}

export default function SimpleMarkdownEditor({
  value,
  onChange,
  height = '500px',
  theme = 'light',
  readOnly = false
}: SimpleMarkdownEditorProps) {
  const [editorTheme, setEditorTheme] = useState<'vs' | 'vs-dark'>('vs');

  useEffect(() => {
    setEditorTheme(theme === 'dark' ? 'vs-dark' : 'vs');
  }, [theme]);

  const handleEditorDidMount = (editor: any) => {
    // 配置编辑器选项
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      folding: true,
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      cursorBlinking: 'blink',
      readOnly: readOnly,
      automaticLayout: true,
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="markdown-editor w-full h-full">
      <Editor
        height={height}
        defaultLanguage="markdown"
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={editorTheme}
        options={{
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: readOnly,
          cursorStyle: 'line',
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbers: 'on',
          folding: true,
          fontSize: 14,
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        }}
      />
    </div>
  );
}
