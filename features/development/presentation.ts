import type { FallbackReason } from "@/core/ai/contracts";
import type { CareerDataset } from "@/core/domain/schemas";
import type { Language } from "@/stores/types";

const aiMessagesRu: Record<FallbackReason, { title: string; detail: string }> = {
  not_configured: { title: "Ключ OpenAI пока не загружен", detail: "Добавьте OPENAI_API_KEY в .env.local в корне проекта и перезапустите dev-сервер. Сам ключ в интерфейсе не отображается." },
  disabled: { title: "AI выключен для этого запуска", detail: "Для локального production-демо включите AI_DEMO_ENABLED=true и перезапустите сервер." },
  authentication: { title: "OpenAI не принял API-ключ", detail: "Проверьте действующий ключ проекта в .env.local и перезапустите сервер. Не отправляйте ключ в чат." },
  quota: { title: "Исчерпана квота OpenAI API", detail: "Проверьте баланс и лимиты API-проекта в OpenAI Platform, затем повторите запрос." },
  rate_limit: { title: "OpenAI просит немного подождать", detail: "Достигнут лимит запросов провайдера. Повторите через минуту." },
  model_unavailable: { title: "У проекта нет доступа к этой модели", detail: "Проверьте OPENAI_MODEL и доступные модели своего API-проекта. После изменения настроек перезапустите сервер." },
  provider_configuration: { title: "OpenAI отклонил настройки запроса", detail: "Проверьте доступ к Responses API и поддержку Structured Outputs выбранной моделью." },
  timeout: { title: "AI не успел ответить", detail: "Запрос остановлен по таймауту. Попробуйте ещё раз. Ниже сохранён базовый подбор — это не ответ AI." },
  provider_error: { title: "Не удалось получить ответ OpenAI", detail: "Проверьте соединение с API и настройки проекта. Можно повторить запрос; прогресс не потерян." },
  invalid_output: { title: "Ответ AI не прошёл проверку", detail: "Модель выбрала неподтверждённые данные. Мы сохранили проверенный базовый подбор. Попробуйте ещё раз." },
  no_candidates: { title: "Пока нет подходящего следующего шага", detail: "Проверьте цель, активное обучение и требования к участию. AI не придумывает мероприятия вне каталога." },
};
const emptyMessagesRu = {
  goal_requirements_met: "Требования этой цели уже закрыты. Можно выбрать новую цель или продолжить развитие в текущей роли.",
  no_goal_improving_activity: "Доступные мероприятия пока не закрывают разрывы выбранной цели. Попробуйте уточнить направление развития.",
  no_available_activity: "Сейчас нет подходящих мероприятий. Посмотрите активное обучение и будущие сессии в каталоге.",
};

const aiMessagesEn: Record<FallbackReason, { title: string; detail: string }> = {
  not_configured: { title: "OpenAI key is not configured", detail: "Add OPENAI_API_KEY to .env.local in the project root and restart the dev server. The key is never shown in the interface." },
  disabled: { title: "AI is disabled for this run", detail: "Set AI_DEMO_ENABLED=true for the local production demo and restart the server." },
  authentication: { title: "OpenAI rejected the API key", detail: "Check the project key in .env.local and restart the server. Do not share the key in chat." },
  quota: { title: "OpenAI API quota is exhausted", detail: "Check the API project balance and limits in OpenAI Platform, then try again." },
  rate_limit: { title: "OpenAI is rate limiting requests", detail: "The provider request limit was reached. Try again in a minute." },
  model_unavailable: { title: "This model is unavailable to the project", detail: "Check OPENAI_MODEL and the models available to your API project. Restart the server after changing settings." },
  provider_configuration: { title: "OpenAI rejected the request settings", detail: "Check access to the Responses API and support for Structured Outputs in the selected model." },
  timeout: { title: "AI did not respond in time", detail: "The request timed out. Try again. The baseline recommendations below are still available." },
  provider_error: { title: "Could not get an OpenAI response", detail: "Check the API connection and project settings. You can retry without losing progress." },
  invalid_output: { title: "AI response failed validation", detail: "The model selected unverified data. The validated baseline recommendations are still available. Try again." },
  no_candidates: { title: "No suitable next step yet", detail: "Check your goal, active learning, and eligibility. AI does not invent activities outside the catalog." },
};

const emptyMessagesEn: typeof emptyMessagesRu = {
  goal_requirements_met: "This goal's requirements are already met. Choose a new goal or keep growing in your current role.",
  no_goal_improving_activity: "Available activities do not currently close the gaps for this goal. Try refining your development direction.",
  no_available_activity: "No suitable activities are available now. Check active learning and future sessions in the catalog.",
};

export const getAIMessages = (language: Language) => language === "ru" ? aiMessagesRu : aiMessagesEn;
export const getEmptyMessages = (language: Language) => language === "ru" ? emptyMessagesRu : emptyMessagesEn;
export const shortDate = (date: string, language: Language = "ru") => new Intl.DateTimeFormat(language, { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
export const formatLabels: Record<Language, Record<string, string>> = {
  ru: { self_paced: "В своём темпе", online: "Онлайн", offline: "Очно" },
  en: { self_paced: "Self-paced", online: "Online", offline: "In person" },
};

/** Personal milestones count voluntary completions only; no company-wide leaderboard or rewards. */
export function getPersonalMilestones(dataset: CareerDataset, employeeId: string, language: Language = "ru") {
  const events = new Map(dataset.events.map((event) => [event.event_id, event]));
  const completed = dataset.activity_history.filter((record) => record.employee_id === employeeId && record.status === "completed" && !events.get(record.event_id)?.mandatory);
  return {
    completedCount: completed.length,
    badges: [
      { title: language === "ru" ? "Первый шаг" : "First step", description: language === "ru" ? "Завершить 1 добровольную активность" : "Complete 1 voluntary activity", reached: completed.length >= 1, target: 1 },
      { title: language === "ru" ? "В своём ритме" : "At your own pace", description: language === "ru" ? "Завершить 5 добровольных активностей" : "Complete 5 voluntary activities", reached: completed.length >= 5, target: 5 },
      { title: language === "ru" ? "Иду дальше" : "Keep going", description: language === "ru" ? "Завершить 10 добровольных активностей" : "Complete 10 voluntary activities", reached: completed.length >= 10, target: 10 },
    ],
  };
}
