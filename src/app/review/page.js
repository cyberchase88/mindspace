'use client';
import { useState } from 'react';
import NoteSelection from '../../components/NoteSelection';
import ReviewSession from '../../components/ReviewSession';
import { useSearchParams } from 'next/navigation';

const USER_ID = 'a84fe585-37ac-4bf1-bc17-5ba87c228555'; // hardcoded for now

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const noteIdsParam = searchParams.get('noteIds');
  const noteIdsFromQuery = noteIdsParam ? noteIdsParam.split(',') : null;

  const [selectedNoteIds, setSelectedNoteIds] = useState(null);

  // If noteIds are in the URL, use them for the review session
  if (noteIdsFromQuery && noteIdsFromQuery.length > 0) {
    return <ReviewSession userId={USER_ID} noteIds={noteIdsFromQuery} />;
  }

  // Otherwise, use the normal selection flow
  if (!selectedNoteIds) {
    return (
      <NoteSelection
        userId={USER_ID}
        onStartReview={setSelectedNoteIds}
      />
    );
  }

  return <ReviewSession userId={USER_ID} noteIds={selectedNoteIds} />;
} 