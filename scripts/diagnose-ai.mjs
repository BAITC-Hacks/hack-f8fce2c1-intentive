import nextEnv from "@next/env";
import { readAIConfig } from "../server/ai/config.ts";
import { createOpenAIProvider } from "../server/ai/openai-transport.ts";
import { AIProviderError } from "../server/ai/errors.ts";

// One neutral API probe. No dataset, employee information or interests are read.
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const config = readAIConfig();
const key = process.env.OPENAI_API_KEY?.trim();
const started = Date.now();
let reason = key ? null : "not_configured";
let connected = false;
if (key) {
  try {
    const result = await createOpenAIProvider(key, config)(JSON.stringify({
      mode: "select", limit: 1,
      candidates: [{ eventId: "connection-test", facts: [
        { reasonId: 0, text: "Neutral connectivity test, no employee data." },
        { reasonId: 1, text: "Neutral connectivity test, no skills data." },
        { reasonId: 2, text: "Neutral connectivity test, no history data." },
      ] }],
    }), AbortSignal.timeout(config.timeoutMs));
    connected = result?.choices?.[0]?.eventId === "connection-test";
    if (!connected) reason = "invalid_output";
  } catch (error) {
    reason = error instanceof AIProviderError ? error.reason : error?.name === "TimeoutError" ? "timeout" : "provider_error";
  }
}
console.log(JSON.stringify({ keyConfigured: Boolean(key), model: config.model, connected, reason,
  elapsedMs: Date.now() - started, productionDemoEnabled: process.env.AI_DEMO_ENABLED === "true" }, null, 2));
if (!connected) process.exitCode = 1;
