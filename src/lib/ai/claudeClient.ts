import Anthropic from "@anthropic-ai/sdk";
import type { ConditionIndicator, DomainScores } from "../../engine/types";
import type { Locale } from "../../types";

const MODEL = "claude-sonnet-4-6";

function getClient(): Anthropic | null {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  if (!apiKey) return null;
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

function buildPrompt(name: string, domainScores: DomainScores, conditions: ConditionIndicator[], locale: Locale) {
  const domainLines = Object.entries(domainScores)
    .map(([d, v]) => `${d}: ${v}/100`)
    .join(", ");
  const conditionLines = conditions.map((c) => `${c.id}: ${c.level}`).join(", ");

  return `Profile name: ${name}
Domain scores (0-100, higher is better): ${domainLines}
Condition indicators (three levels only — typical/notable/refer, NEVER a diagnosis): ${conditionLines}

Write a warm, encouraging, plain-language summary of these cognitive screening results for the person named above, in ${
    locale === "ar" ? "Arabic" : "English"
  }. 3-5 short sentences. Lead with a genuine strength. Mention at most one area worth extra practice, framed kindly. Never name a medical/psychiatric condition and never use diagnostic language ("you have X"). If any condition indicator is "refer", gently suggest a specialist could offer peace of mind — otherwise skip that. End with a brief reminder that this is an early screening, not a diagnosis. Do not use markdown formatting.`;
}

export interface StreamCallbacks {
  onDelta: (chunk: string) => void;
  onDone: (fullText: string) => void;
  onError: (err: unknown) => void;
}

export function isClaudeConfigured() {
  return Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY);
}

export async function streamNarrative(
  name: string,
  domainScores: DomainScores,
  conditions: ConditionIndicator[],
  locale: Locale,
  callbacks: StreamCallbacks
) {
  const client = getClient();
  if (!client) {
    callbacks.onError(new Error("Claude API key not configured"));
    return;
  }

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 500,
      output_config: { effort: "medium" },
      messages: [{ role: "user", content: buildPrompt(name, domainScores, conditions, locale) }],
    });

    stream.on("text", (delta) => callbacks.onDelta(delta));
    stream.on("error", (err) => callbacks.onError(err));

    const finalText = await stream.finalText();
    callbacks.onDone(finalText);
  } catch (err) {
    callbacks.onError(err);
  }
}
