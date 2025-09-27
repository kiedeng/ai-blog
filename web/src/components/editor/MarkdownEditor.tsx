'use client';

import { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { editor, KeyMod, KeyCode } from 'monaco-editor';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  theme?: 'light' | 'dark';
  readOnly?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  height = '500px',
  theme = 'light',
  readOnly = false
}: MarkdownEditorProps) {
  const [editorTheme, setEditorTheme] = useState<'vs' | 'vs-dark'>('vs');
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    setEditorTheme(theme === 'dark' ? 'vs-dark' : 'vs');
  }, [theme]);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    // 配置编辑器选项
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      folding: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      renderLineHighlight: 'line',
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      cursorBlinking: 'blink',
      cursorSmoothCaretAnimation: true,
      smoothScrolling: true,
      mouseWheelZoom: true,
      contextmenu: true,
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: readOnly,
      automaticLayout: true,
    });

    // 添加Markdown快捷键
    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyB, () => {
      editor.trigger('', 'editor.action.formatDocument', {});
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="markdown-editor">
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
