import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NotesList from '../NotesList';

// Mock the notes API
jest.mock('@/lib/api/notes', () => ({
  notesApi: {
    getNotes: jest.fn(),
  },
}));

// Create a new QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Wrapper component to provide React Query context
const wrapper = ({ children }) => {
  const testQueryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('NotesList', () => {
  it('renders loading state', () => {
    render(<NotesList />, { wrapper });
    expect(screen.getByText('Loading notes...')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    const errorMessage = 'Failed to fetch notes';
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock the API to throw an error
    const { notesApi } = require('@/lib/api/notes');
    notesApi.getNotes.mockRejectedValueOnce(new Error(errorMessage));

    render(<NotesList />, { wrapper });
    
    // Wait for error message to appear
    const errorElement = await screen.findByText(`Error: ${errorMessage}`);
    expect(errorElement).toBeInTheDocument();
  });

  it('renders notes list', async () => {
    const mockNotes = [
      { id: 1, title: 'Note 1', content: 'Content 1' },
      { id: 2, title: 'Note 2', content: 'Content 2' },
    ];

    // Mock the API to return notes
    const { notesApi } = require('@/lib/api/notes');
    notesApi.getNotes.mockResolvedValueOnce(mockNotes);

    render(<NotesList />, { wrapper });

    // Wait for notes to appear
    const note1 = await screen.findByText('Note 1');
    const note2 = await screen.findByText('Note 2');

    expect(note1).toBeInTheDocument();
    expect(note2).toBeInTheDocument();
  });
}); 