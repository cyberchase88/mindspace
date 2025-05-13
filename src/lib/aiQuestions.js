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
  const prompt = `
You are an expert tutor. Given the following note content and a user's answer to a question about it, rate the user's recall on a scale from 0 (blackout) to 5 (perfect recall). Also, provide a brief explanation for your rating.

Respond in JSON like: { "score": <0-5>, "feedback": "<short explanation>" }

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
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert at evaluating recall.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 256,
      temperature: 0.2,
    }),
  });

  const data = await response.json();
  let score = 0;
  let feedback = '';
  try {
    const json = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    score = json.score ?? 0;
    feedback = json.feedback ?? '';
  } catch {
    // fallback: try to extract JSON from the string
    const match = data.choices?.[0]?.message?.content?.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const json = JSON.parse(match[0]);
        score = json.score ?? 0;
        feedback = json.feedback ?? '';
      } catch {}
    }
  }
  return { score, feedback };
}