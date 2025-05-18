import { Node, mergeAttributes } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { supabase } from '@/lib/supabase';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

// Helper: Fetch note titles from Supabase matching the query
async function fetchNoteSuggestions(query) {
  const { data, error } = await supabase
    .from('notes')
    .select('title')
    .ilike('title', `%${query}%`)
    .limit(10);
  if (error) return [];
  return data.map((n) => n.title);
}

// Suggestion renderer for dropdown
function renderDropdown({ items, command, clientRect }) {
  let dropdown = document.createElement('div');
  dropdown.className = 'wiki-link-suggestion-dropdown';
  items.forEach((item) => {
    const option = document.createElement('div');
    option.className = 'wiki-link-suggestion-item';
    option.textContent = item;
    option.onclick = () => command({ title: item });
    dropdown.appendChild(option);
  });
  if (clientRect) {
    tippy('body', {
      getReferenceClientRect: clientRect,
      content: dropdown,
      showOnCreate: true,
      interactive: true,
      trigger: 'manual',
      placement: 'bottom-start',
      onHidden(instance) {
        instance.destroy();
      },
    });
  }
}

export function WikiLinkNode() {
  return Node.create({
    name: 'wikiLink',
    group: 'inline',
    inline: true,
    selectable: true,
    atom: true,
    addOptions() {
      return {
        HTMLAttributes: {},
        suggestion: {
          char: '[[',
          startOfLine: false,
          items: async ({ query }) => {
            if (!query) return [];
            return await fetchNoteSuggestions(query);
          },
          render: renderDropdown,
          command: ({ editor, range, props }) => {
            editor
              .chain()
              .focus()
              .insertContentAt(range, [
                {
                  type: this.name,
                  attrs: { title: props.title },
                },
                { type: 'text', text: ' ' },
              ])
              .run();
          },
        },
      };
    },
    addAttributes() {
      return {
        title: {
          default: '',
        },
      };
    },
    parseHTML() {
      return [
        {
          tag: 'span[data-wiki-link-node]',
        },
      ];
    },
    renderHTML({ node, HTMLAttributes }) {
      return [
        'span',
        mergeAttributes(HTMLAttributes, { 'data-wiki-link-node': 'true', class: 'wiki-link-node' }),
        `[[${node.attrs.title}]]`,
      ];
    },
    addProseMirrorPlugins() {
      return [
        Suggestion({ ...this.options.suggestion }),
      ];
    },
  });
} 