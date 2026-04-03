type ChatMessage = { role: 'system' | 'user'; content: string };

export async function askOpenAI(messages: ChatMessage[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const systemMsg = messages.find((m) => m.role === 'system')?.content ?? '';
  const userMsgs = messages.filter((m) => m.role === 'user').map((m) => ({
    role: 'user',
    parts: [{ text: m.content }],
  }));

  const body: Record<string, unknown> = { contents: userMsgs };
  if (systemMsg) {
    body.system_instruction = { parts: [{ text: systemMsg }] };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) return null;
  const json = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
}
