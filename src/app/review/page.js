'use client';
import { useState } from 'react';
import NoteSelection from '../../components/NoteSelection';
import ReviewSession from '../../components/ReviewSession';

const USER_ID = 'a84fe585-37ac-4bf1-bc17-5ba87c228555'; // hardcoded for now

export default function ReviewPage() {
  const [selectedNoteIds, setSelectedNoteIds] = useState(null);

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