'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { WikiLinkMention } from './extensions/WikiLinkMention';
import styles from './TipTapEditor.module.scss';

const TipTapEditor = ({ content, onChange, placeholder = 'Start writing...' }) => {
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
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapEditor; 