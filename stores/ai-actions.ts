import type { StoreApi } from "zustand/vanilla";
import type { UserStore } from "./types";
import { aiRequestSchema, type AIClientState, type AIResponse } from "../core/ai/contracts";

export const idleAI = (): AIClientState => ({ status: "idle", response: null, error: null });

export function createAIActions(set: StoreApi<UserStore>["setState"], get: StoreApi<UserStore>["getState"], transport: typeof fetch = fetch) {
  let controller: AbortController | undefined;
  const invalidate = () => { controller?.abort(); controller = undefined; return idleAI(); };
  const requestAIRecommendations = async () => {
    if (get().ai.status === "loading") return;
    const before = get();
    const employeeId = before.selectedEmployeeId;
    const preferences = before.preferencesByEmployee[employeeId];
    const token = new AbortController();
    controller = token;
    const current = () => controller === token && get().dataset === before.dataset && get().selectedEmployeeId === employeeId
      && get().preferencesByEmployee[employeeId] === preferences;
    set({ ai: { status: "loading", response: null, error: null } });
    const timer = setTimeout(() => token.abort(), 12000);
    try {
      const body = aiRequestSchema.parse({ employeeId, targetGoal: preferences.targetGoal, interests: preferences.interests,
        learningFormat: preferences.learningFormat, weeklyHours: preferences.weeklyHours,
        commands: before.activityCommands.filter((command) => command.employeeId === employeeId) });
      const response = await transport("/api/recommendations", { method: "POST", signal: token.signal,
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error(response.status === 429 ? "Слишком много запросов. Повторите через минуту."
        : response.status === 403 ? "AI-запрос заблокирован. При локальном запуске через npm run start включите AI_DEMO_ENABLED=true и перезапустите сервер."
        : response.status === 400 ? "Не удалось применить цель или историю. Обновите демосессию и повторите запрос."
        : "Не удалось связаться с AI. Базовые рекомендации доступны ниже.");
      const result = await response.json() as AIResponse;
      if (result.result?.employeeId !== employeeId || !["ai", "fallback"].includes(result.source)) throw new Error("Invalid AI response");
      if (current()) set({ ai: { status: "ready", response: result, error: null } });
    } catch (error) {
      if (current()) set({ ai: { status: "error", response: null, error: token.signal.aborted
        ? "Время ожидания истекло. Повторите запрос; базовые рекомендации доступны ниже." : error instanceof Error ? error.message : "AI временно недоступен." } });
    } finally { clearTimeout(timer); if (controller === token) controller = undefined; }
  };
  return { invalidate, requestAIRecommendations };
}
