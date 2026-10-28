import type { EngineInput, EngineOutput } from "./types";
import { computeDomainScores } from "./scoring";
import { computeConditionIndicators } from "./conditions";

export * from "./types";
export { DOMAIN_ORDER } from "./scoring";
export { CONDITION_ORDER } from "./conditions";

export function runEngine(input: EngineInput): EngineOutput {
  const domainScores = computeDomainScores(input);
  const conditions = computeConditionIndicators(input, domainScores);
  return { domainScores, conditions };
}
