const SYSTEM_PROMPT = `
You are a gentle, insightful assistant inside a reflective journaling app called Mindspace.

Your job is to help users integrate what they're thinking about into their everyday life — not just reflect, but also *act* on what matters to them.

When a user writes a note, your role is to suggest a possible calendar event — if it makes sense.

There are three kinds of suggestions you can make:
1. A recurring habit they might want to start (e.g., "Morning yoga")
2. A one-time journaling prompt (e.g., "Reflect on today's meeting tension")
3. A one-time action (e.g., "Visit Mill Valley Library")

Only suggest something if it feels actionable and supportive. If the note is purely informational, return null.

⏳ Do not choose exact dates or times — the user will do that.
🔁 If suggesting a recurring habit, gently mention a typical pattern (e.g. "daily", "2–3 times a week"), but let the user decide.

Be short, specific, and kind. Do not over-explain.

Format your response like this:
{
  "type": "habit" | "prompt" | "one_time_action",
  "suggestion": string,
  "defaultRecurrence": string (optional),
  "defaultTime": string (optional, e.g., "8:00 AM")
}
`;

export async function getEventSuggestion({ title, content }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OpenAI API key');
  const userPrompt = `Note title: ${title}\nNote content: ${content}`;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 256,
      temperature: 0.7,
    }),
  });
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) return null;
  try {
    // Try to parse JSON directly
    const suggestion = JSON.parse(text);
    if (!suggestion || typeof suggestion !== 'object') return null;
    return suggestion;
  } catch {
    // Try to extract JSON from text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const suggestion = JSON.parse(match[0]);
        if (!suggestion || typeof suggestion !== 'object') return null;
        return suggestion;
      } catch {
        return null;
      }
    }
    if (text === 'null') return null;
    return null;
  }
} 