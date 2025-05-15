'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { WikiLinkMention } from './extensions/WikiLinkMention';
import styles from './TipTapEditor.module.scss';
import { useNote } from '@/lib/context/NoteContext';
import { useState, useEffect } from 'react';
import { getStaticUserId } from '@/lib/supabase';

const TipTapEditor = ({ content, onChange, placeholder = 'Start writing...', saveNote }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Image,
      Placeholder.configure({
        placeholder,
      }),
      WikiLinkMention,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: styles.editor,
      },
    },
    immediatelyRender: false,
  });

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`${styles.button} ${editor?.isActive('bold') ? styles.active : ''}`}
          title="Bold (⌘B)"
        >
          B
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`${styles.button} ${editor?.isActive('italic') ? styles.active : ''}`}
          title="Italic (⌘I)"
        >
          I
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`${styles.button} ${editor?.isActive('heading', { level: 1 }) ? styles.active : ''}`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${styles.button} ${editor?.isActive('heading', { level: 2 }) ? styles.active : ''}`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`${styles.button} ${editor?.isActive('bulletList') ? styles.active : ''}`}
          title="Bullet List"
        >
          •
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`${styles.button} ${editor?.isActive('orderedList') ? styles.active : ''}`}
          title="Numbered List"
        >
          1.
        </button>
        <RememberToggleSwitch onAutoSave={saveNote} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

function RememberToggleSwitch({ onAutoSave }) {
  const { currentNote, setCurrentNote } = useNote();
  const [remembered, setRemembered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentNote?.id) return;
    setLoading(true);
    setError(null);
    const userId = getStaticUserId();
    // Only fetch remembered state, do not toggle
    fetch(`/api/spaced-repetition/is-remembered?noteId=${currentNote.id}&userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setRemembered(!!data.remembered);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch remember state');
        setLoading(false);
      });
  }, [currentNote?.id]);

  const handleToggle = async (e) => {
    console.log('Toggle handler fired');
    const checked = e.target.checked;
    console.log('currentNote:', currentNote);
    if (checked) {
      console.log('Spaced Repetition enabled');
    } else {
      console.log('Spaced Repetition disabled');
    }
    setLoading(true);
    setError(null);
    if (!currentNote || !currentNote.id) {
      setError('Note must be saved before enabling spaced repetition.');
      return;
    }
    try {
      const userId = getStaticUserId();
      const res = await fetch('/api/spaced-repetition/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: currentNote.id, userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setRemembered(!!data.remembered);
        // If enabling spaced repetition, trigger AI question generation
        if (checked) {
          // Check if AI questions already exist for this note
          const aiQRes = await fetch(`/api/ai-questions/review?user_id=${userId}&note_ids=${currentNote.id}`);
          const aiQData = await aiQRes.json();
          if (!aiQData.questions || aiQData.questions.length === 0) {
            // No AI questions exist, so generate them
            const genRes = await fetch('/api/ai-questions/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                note_id: currentNote.id,
                user_id: userId,
                note_content: currentNote.content,
              }),
            });
            if (!genRes.ok) {
              const err = await genRes.json();
              console.error('Failed to generate AI questions:', err.error || genRes.statusText);
            } else {
              console.log('AI questions generated for note', currentNote.id);
            }
          } else {
            console.log('AI questions already exist for note', currentNote.id);
          }
        }
      } else {
        setError(data.error || 'Failed to update');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} title="When enabled, this note will be added to your spaced repetition review queue.">
        <input
          type="checkbox"
          checked={remembered}
          onChange={handleToggle}
          disabled={false}
          style={{ width: 36, height: 20, accentColor: '#95d5b2' }}
        />
        <span style={{ fontSize: 14, color: '#3a5a40' }}>Enable Spaced Repetition for this note</span>
      </label>
      {loading && <span style={{ marginLeft: 8 }}>⏳</span>}
      {error && <span style={{ color: 'red', marginLeft: 8 }}>{error}</span>}
    </div>
  );
}

export default TipTapEditor; 