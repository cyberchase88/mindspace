import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../styles/garden-theme.css';
import Link from 'next/link';
import ReactStringReplace from 'react-string-replace';

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="garden-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="garden-h1" {...props} />,
          h2: ({ node, ...props }) => <h2 className="garden-h2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="garden-h3" {...props} />,
          p: ({ node, ...props }) => <p className="garden-p" {...props} />,
          a: ({ node, ...props }) => <a className="garden-link" {...props} />,
          ul: ({ node, ...props }) => <ul className="garden-list" {...props} />,
          ol: ({ node, ...props }) => <ol className="garden-list" {...props} />,
          li: ({ node, ...props }) => <li className="garden-list-item" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="garden-blockquote" {...props} />
          ),
          code: ({ node, inline, ...props }) => (
            inline ? 
              <code className="garden-inline-code" {...props} /> :
              <code className="garden-code-block" {...props} />
          ),
          pre: ({ node, ...props }) => <pre className="garden-pre" {...props} />,
          text: ({ children }) => {
            let content = children;
            content = ReactStringReplace(content, /\[\[([^\]]+)\]\]/g, (match, i) => (
              <Link key={i} href={`/notes/${encodeURIComponent(match)}`} className="wiki-link">{`[[${match}]]`}</Link>
            ));
            return <>{content}</>;
          },
        }}
      >
        {content}
      </ReactMarkdown>

      <style jsx>{`
        .garden-markdown {
          font-family: 'Inter', sans-serif;
          color: var(--garden-text);
          line-height: 1.6;
        }

        .garden-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          color: var(--garden-text);
          margin: var(--garden-spacing-large) 0 var(--garden-spacing-medium);
          position: relative;
          padding-bottom: var(--garden-spacing-small);
        }

        .garden-h1::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 60px;
          height: 3px;
          background: var(--garden-primary);
          opacity: 0.3;
        }

        .garden-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          color: var(--garden-text);
          margin: var(--garden-spacing-medium) 0 var(--garden-spacing-small);
        }

        .garden-h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem;
          color: var(--garden-text);
          margin: var(--garden-spacing-medium) 0 var(--garden-spacing-small);
        }

        .garden-p {
          margin: var(--garden-spacing-small) 0;
          color: var(--garden-text-light);
        }

        .garden-link {
          color: var(--garden-primary);
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color var(--garden-transition-quick);
        }

        .garden-link:hover {
          border-bottom-color: var(--garden-primary);
        }

        .garden-list {
          margin: var(--garden-spacing-small) 0;
          padding-left: var(--garden-spacing-medium);
        }

        .garden-list-item {
          margin: var(--garden-spacing-xs) 0;
          color: var(--garden-text-light);
        }

        .garden-blockquote {
          margin: var(--garden-spacing-medium) 0;
          padding: var(--garden-spacing-medium);
          border-left: 4px solid var(--garden-primary);
          background: rgba(124, 154, 146, 0.05);
          border-radius: 0 var(--garden-spacing-small) var(--garden-spacing-small) 0;
          font-style: italic;
          color: var(--garden-text-light);
        }

        .garden-inline-code {
          background: rgba(124, 154, 146, 0.1);
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-family: 'Fira Code', monospace;
          font-size: 0.9em;
          color: var(--garden-text);
        }

        .garden-code-block {
          display: block;
          background: rgba(124, 154, 146, 0.05);
          padding: var(--garden-spacing-medium);
          border-radius: 8px;
          overflow-x: auto;
          font-family: 'Fira Code', monospace;
          font-size: 0.9em;
          line-height: 1.5;
          color: var(--garden-text);
        }

        .garden-pre {
          margin: var(--garden-spacing-medium) 0;
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default MarkdownRenderer; 