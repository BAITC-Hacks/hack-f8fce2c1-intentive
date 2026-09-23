import { z } from "zod";

const configSchema = z.object({
  model: z.string().min(1).default("gpt-6-luna"),
  role: z.enum(["select", "explain"]).default("select"),
  timeoutMs: z.coerce.number().int().min(100).max(30000).default(25000),
  candidateLimit: z.coerce.number().int().min(3).max(12).default(8),
});
export type AIConfig = z.infer<typeof configSchema>;
export const AI_POLICY_VERSION = "grounded-coaching-v2";
export function readAIConfig(env: Record<string, string | undefined> = process.env): AIConfig {
  return configSchema.parse({ model: env.OPENAI_MODEL, role: env.AI_RECOMMENDATION_ROLE,
    timeoutMs: env.AI_TIMEOUT_MS, candidateLimit: env.AI_CANDIDATE_LIMIT });
}
