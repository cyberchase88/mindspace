import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Inserts a new note into the notes table.
 * @param {string} title - The title of the note.
 * @param {string} content - The content of the note.
 * @returns {Promise<object>} The inserted note or error.
 */
export async function createNote(title, content) {
  const { data, error } = await supabase
    .from('notes')
    .insert([{ title, content }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Inserts a new note link into the note_links table.
 * @param {string} sourceNoteId - The ID of the note containing the link.
 * @param {string} targetNoteId - The ID of the note being linked to.
 * @param {string} linkText - The raw text of the link (optional).
 * @returns {Promise<object>} The inserted note link or error.
 */
export async function createNoteLink(sourceNoteId, targetNoteId, linkText = null) {
  const { data, error } = await supabase
    .from('note_links')
    .insert([{ source_note_id: sourceNoteId, target_note_id: targetNoteId, link_text: linkText }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Fetches all note links where the given note is the source (outgoing links).
 * @param {string} noteId - The ID of the source note.
 * @returns {Promise<Array>} Array of note links.
 */
export async function getNoteLinksForNote(noteId) {
  const { data, error } = await supabase
    .from('note_links')
    .select('*')
    .eq('source_note_id', noteId);
  if (error) throw error;
  return data;
}

/**
 * Fetches all backlinks (incoming links) for a given note.
 * @param {string} noteId - The ID of the target note.
 * @returns {Promise<Array>} Array of backlinks.
 */
export async function getBacklinksForNote(noteId) {
  const { data, error } = await supabase
    .from('note_links')
    .select('*')
    .eq('target_note_id', noteId);
  if (error) throw error;
  return data;
}

/**
 * Deletes a note link by its ID.
 * @param {string} linkId - The ID of the note link to delete.
 * @returns {Promise<void>} Throws on error.
 */
export async function deleteNoteLink(linkId) {
  const { error } = await supabase
    .from('note_links')
    .delete()
    .eq('id', linkId);
  if (error) throw error;
}

/**
 * Fetches a note by its ID.
 * @param {string|number} noteId - The ID of the note.
 * @returns {Promise<object>} The note object.
 */
export async function getNoteById(noteId) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .single();
  if (error) throw error;
  return data;
} 