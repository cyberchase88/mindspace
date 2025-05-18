export function prepareNotesForAI(notes) {
  return notes.map(note => ({
    id: note.id,
    title: note.title,
    content: stripHtml(note.content),
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  }));
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '');
} 