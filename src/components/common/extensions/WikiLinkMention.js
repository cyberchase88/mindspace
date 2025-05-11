import { Mention } from '@tiptap/extension-mention';
import tippy from 'tippy.js';
import { supabase } from '@/lib/supabase';
import 'tippy.js/dist/tippy.css';

// Helper: Fetch note titles from Supabase matching the query
async function fetchNoteSuggestions(query) {
  const { data, error } = await supabase
    .from('notes')
    .select('title')
    .ilike('title', `%${query}%`)
    .limit(10);
  if (error) return [];
  return data.map((n) => ({ id: n.title, label: n.title }));
}

export const WikiLinkMention = Mention.configure({
  HTMLAttributes: {
    class: 'wiki-link-node',
    'data-wiki-link-node': 'true',
  },
  suggestion: {
    char: '[[',
    startOfLine: false,
    items: async ({ query }) => {
      if (!query) return [];
      return await fetchNoteSuggestions(query);
    },
    render: () => {
      let component;
      let popup;
      return {
        onStart: (props) => {
          component = document.createElement('div');
          component.className = 'wiki-link-suggestion-dropdown';
          updateItems(props);
          if (props.clientRect) {
            popup = tippy('body', {
              getReferenceClientRect: props.clientRect,
              appendTo: () => document.body,
              content: component,
              showOnCreate: true,
              interactive: true,
              trigger: 'manual',
              placement: 'bottom-start',
              onHidden(instance) {
                instance.destroy();
              },
            });
          }
        },
        onUpdate(props) {
          updateItems(props);
        },
        onKeyDown(props) {
          if (props.event.key === 'Escape') {
            popup[0].hide();
            return true;
          }
          return false;
        },
        onExit() {
          if (popup) popup[0].destroy();
        },
      };
      function updateItems(props) {
        component.innerHTML = '';
        props.items.forEach((item, idx) => {
          const option = document.createElement('div');
          option.className = 'wiki-link-suggestion-item';
          option.textContent = item.label;
          option.onclick = () => props.command({ id: item.id, label: item.label });
          component.appendChild(option);
        });
      }
    },
  },
  renderLabel({ options, node }) {
    return `[[${node.attrs.label}]]`;
  },
}); 