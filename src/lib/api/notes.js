// Mock data
const mockNotes = [
  { id: 1, title: 'Welcome to MindSpace', content: 'This is your first note!' },
  { id: 2, title: 'Getting Started', content: 'Learn how to use MindSpace effectively.' },
  { id: 3, title: 'Tips & Tricks', content: 'Some helpful tips for note-taking.' },
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const notesApi = {
  getNotes: async () => {
    await delay(1000); // Simulate network delay
    return mockNotes;
  },
  
  getNote: async (id) => {
    await delay(500);
    const note = mockNotes.find(note => note.id === id);
    if (!note) throw new Error('Note not found');
    return note;
  }
}; 