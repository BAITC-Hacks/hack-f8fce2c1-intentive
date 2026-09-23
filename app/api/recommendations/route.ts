import { loadStarterDataset } from "@/server/repositories/dataset";
import { aiRequestSchema } from "@/core/ai/contracts";
import { prepareRecommendations } from "@/server/ai/context";
import { readAIConfig } from "@/server/ai/config";
import { createOpenAIProvider } from "@/server/ai/provider";
import { runRecommendationAgent } from "@/server/ai/graph";

export const runtime = "nodejs";
export const maxDuration = 40;
// Small local-demo budget. Production needs identity-based distributed limits and authentication.
let requests: number[] = [];
let inFlight = 0;
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production" && process.env.AI_DEMO_ENABLED !== "true") return json({ error: "AI demo disabled" }, 403);
  if (request.headers.get("origin") !== new URL(request.url).origin) return json({ error: "Same-origin requests required" }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "JSON required" }, 415);
  const now = Date.now();
  requests = requests.filter((time) => now - time < 60000);
  if (requests.length >= 10 || inFlight >= 2) return json({ error: "Too many AI requests. Try again shortly." }, 429);
  requests.push(now);
  inFlight++;
  try {
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "Request body required" }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 32768) { await reader.cancel(); return json({ error: "Request too large" }, 413); }
      chunks.push(value);
    }
    let raw: unknown;
    try { raw = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
    catch { return json({ error: "Invalid JSON" }, 400); }
    const parsed = aiRequestSchema.safeParse(raw);
    if (!parsed.success) return json({ error: "Invalid recommendation request" }, 400);
    const base = await loadStarterDataset();
    let prepared;
    try { prepared = prepareRecommendations(base, parsed.data); }
    catch { return json({ error: "Profile, goal or activity commands are invalid" }, 400); }
    const config = readAIConfig();
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    const provider = apiKey ? createOpenAIProvider(apiKey, config) : null;
    return json(await runRecommendationAgent({ ...prepared, interests: parsed.data.interests, language: parsed.data.language }, config, provider, request.signal));
  } catch { return json({ error: "Unable to process recommendation request" }, 500); }
  finally { inFlight--; }
}
