import { Mark, mergeAttributes } from '@tiptap/core';

export const WikiLinkMark = Mark.create({
  name: 'wikiLink',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-wiki-link]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-wiki-link': 'true', class: 'wiki-link-highlight' }),
      0,
    ];
  },

  addInputRules() {
    return [
      {
        find: /\[\[([^\]]+)\]\]/g,
        handler: ({ state, range, match, commands }) => {
          const title = match[1];
          commands.setMark(this.name, { title });
        },
      },
    ];
  },
});

export default WikiLinkMark; 