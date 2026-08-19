const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

export class AiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Msg = { role: "system" | "user" | "assistant"; content: string };

async function call(messages: Msg[], jsonMode: boolean): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AiError("AI is not configured for this app.", 401);

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    let message = body;
    try {
      const parsed = JSON.parse(body) as { error?: { message?: string }; message?: string };
      message = parsed.error?.message ?? parsed.message ?? body;
    } catch {
      /* keep raw text */
    }
    if (res.status === 429) message = "The AI is busy right now. Please retry in a few seconds.";
    if (res.status === 402)
      message = message || "AI credits are exhausted. The workspace owner needs to add credits.";
    throw new AiError(message || "The AI request failed.", res.status);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}

export async function askText(system: string, user: string): Promise<string> {
  const text = await call(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    false,
  );
  if (!text.trim()) throw new AiError("The AI returned an empty response.", 502);
  return text.trim();
}

export async function askChat(system: string, history: Msg[]): Promise<string> {
  const text = await call([{ role: "system", content: system }, ...history], false);
  if (!text.trim()) throw new AiError("The AI returned an empty response.", 502);
  return text.trim();
}

/** Ask for JSON and parse defensively — AI output is never trusted blindly. */
export async function askJson<T>(system: string, user: string): Promise<T> {
  const raw = await call(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    true,
  );
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const candidate = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    throw new AiError("The AI returned data we couldn't read. Please try again.", 502);
  }
}
