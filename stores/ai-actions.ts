import type { StoreApi } from "zustand/vanilla";
import type { UserStore } from "./types";
import { aiRequestSchema, modelDecisionSchema, type AIClientState, type AIResponse } from "../core/ai/contracts";

export const idleAI = (): AIClientState => ({ status: "idle", response: null, error: null });

export function createAIActions(set: StoreApi<UserStore>["setState"], get: StoreApi<UserStore>["getState"], transport: typeof fetch = fetch) {
  let controller: AbortController | undefined;
  const invalidate = () => { controller?.abort(); controller = undefined; return idleAI(); };
  const requestAIRecommendations = async () => {
    if (get().ai.status === "loading") return;
    const before = get();
    const employeeId = before.selectedEmployeeId;
    const preferences = before.preferencesByEmployee[employeeId];
    const language = before.language;
    const message = (ru: string, en: string) => language === "ru" ? ru : en;
    const token = new AbortController();
    controller = token;
    const current = () => controller === token && get().dataset === before.dataset && get().selectedEmployeeId === employeeId
      && get().preferencesByEmployee[employeeId] === preferences && get().language === language;
    set({ ai: { status: "loading", response: null, error: null } });
    const timer = setTimeout(() => token.abort(), 35000);
    try {
      const body = aiRequestSchema.parse({ employeeId, language, targetGoal: preferences.targetGoal, interests: preferences.interests,
        learningFormat: preferences.learningFormat, weeklyHours: preferences.weeklyHours,
        commands: before.activityCommands.filter((command) => command.employeeId === employeeId) });
      const response = await transport("/api/recommendations", { method: "POST", signal: token.signal,
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error(response.status === 429 ? message("Слишком много запросов. Повторите через минуту.", "Too many requests. Try again in a minute.")
        : response.status === 403 ? message("AI-запрос заблокирован. При локальном запуске через npm run start включите AI_DEMO_ENABLED=true и перезапустите сервер.", "AI request blocked. For a local production run, set AI_DEMO_ENABLED=true and restart the server.")
        : response.status === 400 ? message("Не удалось применить цель или историю. Обновите демосессию и повторите запрос.", "Could not apply the goal or history. Refresh the demo session and try again.")
        : message("Не удалось связаться с AI. Базовые рекомендации доступны ниже.", "Could not reach AI. Baseline recommendations are available below."));
      const result = await response.json() as AIResponse;
      if (result.result?.employeeId !== employeeId || !["ai", "fallback"].includes(result.source)) throw new Error("Invalid AI response");
      if (result.source === "ai") {
        const feedback = modelDecisionSchema.safeParse(result.feedback);
        if (!feedback.success || JSON.stringify(feedback.data.choices.map((choice) => choice.eventId))
          !== JSON.stringify(result.result.recommendations.map((item) => item.eventId))) {
          throw new Error(message("AI не вернул полный разбор. Повторите запрос; если ошибка сохраняется, перезапустите dev-сервер.", "AI did not return a complete review. Try again; if the error persists, restart the dev server."));
        }
        result.feedback = feedback.data;
      }
      if (current()) set({ ai: { status: "ready", response: result, error: null } });
    } catch (error) {
      if (current()) set({ ai: { status: "error", response: null, error: token.signal.aborted
        ? message("Время ожидания истекло. Повторите запрос; базовые рекомендации доступны ниже.", "The request timed out. Try again; baseline recommendations are available below.") : error instanceof Error ? error.message : message("AI временно недоступен.", "AI is temporarily unavailable.") } });
    } finally { clearTimeout(timer); if (controller === token) controller = undefined; }
  };
  return { invalidate, requestAIRecommendations };
}
