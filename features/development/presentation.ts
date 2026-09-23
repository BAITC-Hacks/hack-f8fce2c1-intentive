import type { FallbackReason } from "@/core/ai/contracts";
import type { CareerDataset } from "@/core/domain/schemas";

export const aiMessages: Record<FallbackReason, { title: string; detail: string }> = {
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
export const emptyMessages = {
  goal_requirements_met: "Требования этой цели уже закрыты. Можно выбрать новую цель или продолжить развитие в текущей роли.",
  no_goal_improving_activity: "Доступные мероприятия пока не закрывают разрывы выбранной цели. Попробуйте уточнить направление развития.",
  no_available_activity: "Сейчас нет подходящих мероприятий. Посмотрите активное обучение и будущие сессии в каталоге.",
};

export const shortDate = (date: string) => new Intl.DateTimeFormat("ru", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
export const formatLabel = { self_paced: "В своём темпе", online: "Онлайн", offline: "Очно" };

/** Personal milestones count voluntary completions only; no company-wide leaderboard or rewards. */
export function getPersonalMilestones(dataset: CareerDataset, employeeId: string) {
  const events = new Map(dataset.events.map((event) => [event.event_id, event]));
  const completed = dataset.activity_history.filter((record) => record.employee_id === employeeId && record.status === "completed" && !events.get(record.event_id)?.mandatory);
  return {
    completedCount: completed.length,
    badges: [
      { title: "Первый шаг", description: "Завершить 1 добровольную активность", reached: completed.length >= 1, target: 1 },
      { title: "В своём ритме", description: "Завершить 5 добровольных активностей", reached: completed.length >= 5, target: 5 },
      { title: "Иду дальше", description: "Завершить 10 добровольных активностей", reached: completed.length >= 10, target: 10 },
    ],
  };
}
