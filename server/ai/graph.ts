import { StateGraph, StateSchema, START, END } from "@langchain/langgraph";
import { z } from "zod";
import { modelDecisionSchema, type AIResponse, type FallbackReason } from "../../core/ai/contracts";
import type { CareerDataset } from "../../core/domain/schemas";
import type { RecommendationResult } from "../../core/recommendations/recommend";
import type { Language } from "../../stores/types";
import { AI_POLICY_VERSION, type AIConfig } from "./config";
import type { ModelProvider } from "./provider";
import { AIProviderError } from "./errors";

export interface AgentInput {
  dataset: CareerDataset;
  result: RecommendationResult;
  interests: string;
  language?: Language;
}

/** Provider injection keeps all graph paths testable without credentials or network calls. */
export async function runRecommendationAgent(input: AgentInput, config: AIConfig, provider: ModelProvider | null, externalSignal?: AbortSignal): Promise<AIResponse> {
  const fallback = (reason: FallbackReason): AIResponse => ({ source: "fallback", fallbackReason: reason, model: null, aiPolicyVersion: AI_POLICY_VERSION, feedback: null, result: input.result });
  if (!input.result.candidates.length) return fallback("no_candidates");
  if (!provider) return fallback("not_configured");
  const pool = config.role === "explain" ? input.result.recommendations : input.result.candidates.slice(0, config.candidateLimit);
  const controller = new AbortController();
  const signal = externalSignal ? AbortSignal.any([externalSignal, controller.signal]) : controller.signal;
  const state = new StateSchema({ context: z.string().default(""), output: z.unknown(), response: z.custom<AIResponse>().optional() });
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const graph = new StateGraph(state)
    .addNode("prepare", () => ({ context: JSON.stringify({
      mode: config.role, limit: input.result.recommendations.length,
      requiredEventIds: config.role === "explain" ? pool.map((item) => item.eventId) : null,
      interests: input.interests,
      goalSource: input.result.goal.source,
      candidates: pool.map((candidate) => ({ eventId: candidate.eventId,
        title: input.dataset.events.find((event) => event.event_id === candidate.eventId)!.title,
        description: input.dataset.events.find((event) => event.event_id === candidate.eventId)!.description,
        durationHours: candidate.evidence.durationHours,
        nextSessionDate: candidate.evidence.nextSessionDate,
        factors: candidate.factors, facts: candidate.reasons.map((text, reasonId) => ({ reasonId, text })) })),
    }) }))
    .addNode("choose", async (current) => ({ output: await provider(current.context, signal, input.language ?? "ru") }))
    .addNode("validate", (current) => {
      const parsed = modelDecisionSchema.safeParse(current.output);
      if (!parsed.success) return { response: fallback("invalid_output") };
      const choices = parsed.data.choices;
      const ids = choices.map((choice) => choice.eventId);
      if (choices.length > input.result.recommendations.length || new Set(ids).size !== ids.length
        || (config.role === "explain" && JSON.stringify(ids) !== JSON.stringify(pool.map((item) => item.eventId)))) return { response: fallback("invalid_output") };
      const selected = [];
      for (const choice of choices) {
        const candidate = pool.find((item) => item.eventId === choice.eventId);
        if (!candidate || new Set(choice.reasonIds).size !== choice.reasonIds.length
          || ![0, 1, 2].every((id) => choice.reasonIds.includes(id)) || choice.reasonIds.some((id) => !candidate.reasons[id])) return { response: fallback("invalid_output") };
        selected.push({ ...candidate, reasons: choice.reasonIds.map((id) => candidate.reasons[id]) });
      }
      return { response: { source: "ai", fallbackReason: null, model: config.model, aiPolicyVersion: AI_POLICY_VERSION,
        feedback: parsed.data,
        result: { ...input.result, recommendations: selected } } satisfies AIResponse };
    })
    .addEdge(START, "prepare").addEdge("prepare", "choose").addEdge("choose", "validate").addEdge("validate", END).compile();
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => { timedOut = true; controller.abort(); reject(new Error("AI deadline")); }, config.timeoutMs);
    });
    const output = await Promise.race([graph.invoke({}, { signal, recursionLimit: 6 }), timeout]);
    return output.response ?? fallback("invalid_output");
  } catch (error) { return fallback(timedOut ? "timeout" : error instanceof AIProviderError ? error.reason : "provider_error"); }
  finally { if (timer) clearTimeout(timer); }
}
