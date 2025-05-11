'use client';

import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

// Dynamically import the MDEditor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

const toolbarCommands = [
  'bold',
  'italic',
  'strikethrough',
  'heading',
  'quote',
  'code',
  'code-block',
  'unordered-list',
  'ordered-list',
  'link',
  'image',
  'table',
  'fullscreen',
];

export default function MarkdownEditor({ value, onChange, placeholder = 'Start writing...' }) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={onChange}
        preview="live"
        height={500}
        placeholder={placeholder}
        commands={toolbarCommands}
        toolbars={toolbarCommands}
        toolbarsMode={[]}
        visibleDragbar={false}
        enableScroll={true}
        textareaProps={{
          placeholder: placeholder,
          autoFocus: true,
        }}
        previewOptions={{
          components: {
            code: ({ inline, children, className, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <pre className={className}>
                  <code {...props}>{children}</code>
                </pre>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          },
        }}
      />
    </div>
  );
} 