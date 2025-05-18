import React from 'react';
import { createNote, createNoteLink, getNoteLinksForNote, getBacklinksForNote, deleteNoteLink } from '../lib/supabase';

export default function TestSupabase() {
  // Replace these with real note UUIDs from your notes table for testing
  const sourceNoteId = '445d4992-e225-4277-b6db-1af6d9016374';
  const targetNoteId = 'cfbfbb2a-bc4f-4bde-a77d-a73d6d109be5';
  const [createdLink, setCreatedLink] = React.useState(null);
  const [outgoingLinks, setOutgoingLinks] = React.useState([]);
  const [backlinks, setBacklinks] = React.useState([]);

  const handleAddNote = async () => {
    try {
      const note = await createNote('Test Note', 'This is a test note created from the browser.');
      console.log('Note created:', note);
      alert('Note created! Check the console for details.');
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Error creating note. Check the console for details.');
    }
  };

  const handleCreateNoteLink = async () => {
    try {
      const link = await createNoteLink(sourceNoteId, targetNoteId, '[[Target Note Title]]');
      setCreatedLink(link);
      console.log('Note link created:', link);
      alert('Note link created! Check the console for details.');
    } catch (error) {
      console.error('Error creating note link:', error);
      alert('Error creating note link. Check the console for details.');
    }
  };

  const handleFetchOutgoingLinks = async () => {
    try {
      const links = await getNoteLinksForNote(sourceNoteId);
      setOutgoingLinks(links);
      console.log('Outgoing links:', links);
    } catch (error) {
      console.error('Error fetching outgoing links:', error);
    }
  };

  const handleFetchBacklinks = async () => {
    try {
      const links = await getBacklinksForNote(targetNoteId);
      setBacklinks(links);
      console.log('Backlinks:', links);
    } catch (error) {
      console.error('Error fetching backlinks:', error);
    }
  };

  const handleDeleteNoteLink = async () => {
    if (!createdLink) {
      alert('No link to delete. Create a link first.');
      return;
    }
    try {
      await deleteNoteLink(createdLink.id);
      setCreatedLink(null);
      alert('Note link deleted!');
    } catch (error) {
      console.error('Error deleting note link:', error);
      alert('Error deleting note link. Check the console for details.');
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Test Supabase Note & Note Links</h1>
      <button onClick={handleAddNote}>Add Test Note</button>
      <hr />
      <button onClick={handleCreateNoteLink}>Create Note Link</button>
      <button onClick={handleFetchOutgoingLinks}>Fetch Outgoing Links</button>
      <button onClick={handleFetchBacklinks}>Fetch Backlinks</button>
      <button onClick={handleDeleteNoteLink}>Delete Created Link</button>
      <div style={{ marginTop: 16 }}>
        <strong>Created Link:</strong>
        <pre>{createdLink ? JSON.stringify(createdLink, null, 2) : 'None'}</pre>
        <strong>Outgoing Links:</strong>
        <pre>{JSON.stringify(outgoingLinks, null, 2)}</pre>
        <strong>Backlinks:</strong>
        <pre>{JSON.stringify(backlinks, null, 2)}</pre>
      </div>
      <p style={{ color: 'gray', marginTop: 16 }}>
        <b>Note:</b> Replace <code>SOURCE_NOTE_UUID</code> and <code>TARGET_NOTE_UUID</code> with real note IDs from your database for testing.
      </p>
    </div>
  );
} 