export async function generateActiveRecallQuestions(noteContent, numQuestions = 2) {
    const apiKey = process.env.OPENAI_API_KEY;
    const prompt = `Generate ${numQuestions} open-ended, active recall questions (not multiple choice) based on the following note. Each question should require the user to recall information, not just recognize it. Return only the questions, each on a new line.\n\nNote:\n${noteContent}`;
  
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert at creating active recall questions.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 512,
        temperature: 0.7,
      }),
    });
  
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    // Split questions by line, filter out empty lines
    return text.split('\n').map(q => q.trim()).filter(Boolean);
  }

export async function getAIRecallScore(noteContent, userAnswer) {
  const apiKey = process.env.OPENAI_API_KEY;
  // Further improved prompt for reliable, fair scoring and personalized feedback
  const prompt = `
You are an expert tutor. Given the following note content and a user's answer, rate the user's recall on a scale from 0 (blackout) to 5 (perfect recall). Focus on conceptual understanding, not exact wording. Only deduct points if the user's answer misses key ideas or shows misunderstanding. Do NOT penalize for missing specific words if the meaning is clear.

If the user's answer shows understanding, do not deduct points for missing or rephrased words. Only mention missing concepts if they are essential for understanding, not just for completeness. 
If the answer is correct in meaning, give a score of 5. In your feedback, affirm what the user did well, referencing their answer directly (e.g., "You remembered that they taste great with milk and described them enthusiastically!"). If there are minor gaps, mention what was great and what could be added.

IMPORTANT:
- Only return a single line of valid JSON in this format: {"score": <0-5>, "feedback": "<short explanation>"}
- If the answer is correct but uses different words, give full credit.
- Only mention missing concepts in feedback if they are truly important for understanding.
- Do NOT include extra commentary or text outside the JSON.
- Example: {"score": 5, "feedback": "You remembered that they taste great with milk and described them enthusiastically!"}

Note content:
${noteContent}

User's answer:
${userAnswer}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert at evaluating recall. Only return valid JSON as instructed.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 256,
      temperature: 0.2,
    }),
  });

  const data = await response.json();
  // Debug: log the raw response
  console.log('OpenAI recall score response:', data.choices?.[0]?.message?.content);

  let score = 0;
  let feedback = '';
  let fallbackUsed = false;
  try {
    const json = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    score = typeof json.score === 'number' ? json.score : 0;
    feedback = typeof json.feedback === 'string' && json.feedback.trim() ? json.feedback : '';
    if (feedback === '' || typeof score !== 'number') fallbackUsed = true;
  } catch {
    // fallback: try to extract JSON from the string
    const match = data.choices?.[0]?.message?.content?.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const json = JSON.parse(match[0]);
        score = typeof json.score === 'number' ? json.score : 0;
        feedback = typeof json.feedback === 'string' && json.feedback.trim() ? json.feedback : '';
        if (feedback === '' || typeof score !== 'number') fallbackUsed = true;
      } catch {
        fallbackUsed = true;
      }
    } else {
      fallbackUsed = true;
    }
  }
  if (fallbackUsed) {
    console.error('AI recall score parsing failed or incomplete. Using fallback values.', {
      raw: data.choices?.[0]?.message?.content,
      score,
      feedback
    });
    score = 0;
    feedback = 'No feedback available. Please try again.';
  }
  return { score, feedback };
}