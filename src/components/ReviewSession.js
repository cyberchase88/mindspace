import React, { useEffect, useState } from 'react';

export default function ReviewSession({ userId, noteIds }) {
  // Hardcode user ID if not provided
  const effectiveUserId = userId || 'a84fe585-37ac-4bf1-bc17-5ba87c228555';
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [aiScore, setAiScore] = useState(null);
  const [aiFeedback, setAiFeedback] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch due questions on mount
  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      let url = `/api/ai-questions/review?user_id=${effectiveUserId}&due_only=true`;
      if (noteIds && noteIds.length > 0) {
        url += `&note_ids=${noteIds.join(',')}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setQuestions(data.questions || []);
      setLoading(false);
    }
    fetchQuestions();
  }, [effectiveUserId, noteIds]);

  // Reset state when moving to a new question
  useEffect(() => {
    setUserAnswer('');
    setSubmitted(false);
    setAiScore(null);
    setAiFeedback('');
    if (questions.length > 0 && questions[currentIdx]) {
      setNoteContent(questions[currentIdx].notes?.content || '');
    }
  }, [currentIdx, questions]);

  if (loading) return <div>Loading questions...</div>;
  if (!questions.length) return <div>No questions due for review!</div>;

  const currentQ = questions[currentIdx];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    const res = await fetch('/api/ai-questions/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ai_question_id: currentQ.id,
        user_id: effectiveUserId,
        answer_text: userAnswer,
      }),
    });
    const data = await res.json();
    setAiScore(data.ai_score);
    setAiFeedback(data.ai_feedback);
    setSubmitted(true);
  }

  async function handleRegenerate() {
    const res = await fetch('/api/ai-questions/regenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ai_question_id: currentQ.id,
        user_id: effectiveUserId,
        note_content: noteContent,
      }),
    });
    const data = await res.json();
    // Update the question text in state
    setQuestions(qs =>
      qs.map((q, idx) =>
        idx === currentIdx ? { ...q, question_text: data.question.question_text } : q
      )
    );
    // Reset answer/feedback
    setUserAnswer('');
    setSubmitted(false);
    setAiScore(null);
    setAiFeedback('');
  }

  function handleNext() {
    if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1);
  }
  function handlePrev() {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, color: '#222' }}>
      <h2>Active Recall Review</h2>
      <div>
        <b>Question {currentIdx + 1} of {questions.length}</b>
      </div>
      <div style={{ margin: '16px 0', fontWeight: 500, color: '#222' }}>
        {currentQ.question_text}
      </div>
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <textarea
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            rows={4}
            style={{ width: '100%' }}
            placeholder="Type your answer here..."
          />
          <div style={{ marginTop: 12 }}>
            <button type="submit">Submit Answer</button>
            <button type="button" onClick={handleRegenerate} style={{ marginLeft: 8 }}>
              Regenerate Question
            </button>
          </div>
        </form>
      ) : (
        <div style={{ marginTop: 16 }}>
          <div>
            <b>AI Score:</b> {aiScore} / 5
          </div>
          <div>
            <b>AI Feedback:</b> {aiFeedback}
          </div>
          <div style={{ marginTop: 12, background: '#f9f9f9', padding: 12 }}>
            <b>Original Note Content:</b>
            <div style={{ whiteSpace: 'pre-wrap' }}>{noteContent}</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button onClick={handlePrev} disabled={currentIdx === 0}>Previous</button>
            <button onClick={handleNext} disabled={currentIdx === questions.length - 1} style={{ marginLeft: 8 }}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}