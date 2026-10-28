import type { ConditionIndicator, DomainScores } from "../../engine/types";
import type { AIReport, Locale } from "../../types";
import { generateLocalNarrative } from "./localNarrative";
import { isClaudeConfigured, streamNarrative } from "./claudeClient";

export interface GenerateReportCallbacks {
  onDelta: (chunk: string, fullSoFar: string) => void;
}

/**
 * Streams a Claude-generated narrative when an API key is configured, and
 * transparently falls back to a locally-generated narrative (typed out at a
 * similar pace) when it isn't, or if the request fails for any reason.
 */
export async function generateReportNarrative(
  name: string,
  domainScores: DomainScores,
  conditions: ConditionIndicator[],
  locale: Locale,
  callbacks: GenerateReportCallbacks
): Promise<AIReport> {
  if (isClaudeConfigured()) {
    let full = "";
    try {
      await new Promise<void>((resolve, reject) => {
        streamNarrative(name, domainScores, conditions, locale, {
          onDelta: (chunk) => {
            full += chunk;
            callbacks.onDelta(chunk, full);
          },
          onDone: () => resolve(),
          onError: (err) => reject(err),
        });
      });
      return { narrative: full, generatedAt: new Date().toISOString(), source: "claude" };
    } catch {
      // fall through to local narrative below
    }
  }

  const local = generateLocalNarrative(name, domainScores, conditions, locale);
  await typeOut(local, callbacks.onDelta);
  return { narrative: local, generatedAt: new Date().toISOString(), source: "local" };
}

function typeOut(text: string, onDelta: (chunk: string, fullSoFar: string) => void) {
  return new Promise<void>((resolve) => {
    let i = 0;
    const step = () => {
      const chunkSize = 2;
      const chunk = text.slice(i, i + chunkSize);
      i += chunkSize;
      onDelta(chunk, text.slice(0, i));
      if (i < text.length) {
        setTimeout(step, 18);
      } else {
        resolve();
      }
    };
    step();
  });
}
