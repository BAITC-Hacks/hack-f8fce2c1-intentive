import { z } from "zod";
import { gradeSchema } from "../domain/schemas";
import type { RecommendationResult } from "../recommendations/recommend";

const id = z.string().min(1).max(100);
export const activityCommandSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("start"), employeeId: id, eventId: id, recordId: id }).strict(),
  z.object({ kind: z.literal("complete"), employeeId: id, recordId: id }).strict(),
]);
export type ActivityCommand = z.infer<typeof activityCommandSchema>;
export const aiRequestSchema = z.object({
  employeeId: id,
  targetGoal: z.object({ target_role: z.string().min(1).max(100), target_grade: gradeSchema }).nullable(),
  interests: z.string().max(2000),
  learningFormat: z.enum(["any", "self_paced", "workshop", "mentoring"]),
  weeklyHours: z.enum(["undecided", "1", "2", "4"]),
  commands: z.array(activityCommandSchema).max(100),
}).strict();
export type AIRequest = z.infer<typeof aiRequestSchema>;
export const modelDecisionSchema = z.object({
  choices: z.array(z.object({ eventId: id, reasonIds: z.array(z.number().int().min(0).max(10)).min(3).max(6) }).strict()).min(1).max(3),
}).strict();
export type ModelDecision = z.infer<typeof modelDecisionSchema>;
export type FallbackReason = "not_configured" | "disabled" | "timeout" | "provider_error" | "invalid_output" | "no_candidates"
  | "authentication" | "quota" | "rate_limit" | "model_unavailable" | "provider_configuration";
export interface AIResponse {
  source: "ai" | "fallback";
  fallbackReason: FallbackReason | null;
  model: string | null;
  aiPolicyVersion: string;
  result: RecommendationResult;
}
export interface AIClientState {
  status: "idle" | "loading" | "ready" | "error";
  response: AIResponse | null;
  error: string | null;
}
