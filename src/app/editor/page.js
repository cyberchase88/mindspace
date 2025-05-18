'use client';

import { useState } from 'react';
import MarkdownEditor from '@/components/common/MarkdownEditor';
import pageStyles from '../../app/page.module.scss';

export default function EditorPage() {
  const [content, setContent] = useState('');

  return (
    <div className={pageStyles.homePage}>
      <header className={pageStyles.gardenHeader} style={{ maxWidth: 700, margin: '2rem auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Markdown Editor</h1>
        <MarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="Write your note here..."
        />
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Preview:</h2>
          <div style={{ padding: '1rem', borderRadius: 8, background: 'rgba(255,255,255,0.7)', minHeight: 80 }}>
            {content}
          </div>
        </div>
      </header>
    </div>
  );
} 