'use client';

import { useState } from 'react';
import MarkdownEditor from '@/components/common/MarkdownEditor';

export default function EditorPage() {
  const [content, setContent] = useState('');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Markdown Editor</h1>
      <MarkdownEditor
        value={content}
        onChange={setContent}
        placeholder="Write your note here..."
      />
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Preview:</h2>
        <div className="p-4 border rounded">
          {content}
        </div>
      </div>
    </div>
  );
} 