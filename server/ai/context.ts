import type { CareerDataset } from "../../core/domain/schemas";
import type { AIRequest } from "../../core/ai/contracts";
import { createRecommendationEngine } from "../../core/recommendations/recommend";
import { completeActivity } from "../../core/activities/complete";
import { startActivity } from "../../core/activities/start";

/** Replays only permitted demo commands against server-owned facts. No arbitrary client profiles or scores. */
export function prepareRecommendations(base: CareerDataset, request: AIRequest) {
  let dataset = base;
  for (const command of request.commands) {
    if (command.employeeId !== request.employeeId) throw new Error("Command belongs to another employee");
    if (command.kind === "start") {
      if (!command.recordId.startsWith(`LOCAL_${request.employeeId}_`)) throw new Error("Invalid local participation ID");
      dataset = startActivity(dataset, request.employeeId, command.eventId, command.recordId);
    } else dataset = completeActivity(dataset, request.employeeId, command.recordId);
  }
  const normalize = (text: string) => ` ${text.toLowerCase().replace(/[^\p{L}\p{N}_]+/gu, " ").trim()} `;
  const interests = normalize(request.interests);
  const interestSkillIds = dataset.skills.filter((skill) => interests.includes(normalize(skill.name)) || interests.includes(normalize(skill.skill_id))).map((skill) => skill.skill_id);
  const result = createRecommendationEngine(dataset).recommend(request.employeeId, request.targetGoal, {
    preferredFormat: request.learningFormat === "self_paced" ? "self_paced" : undefined,
    preferredType: request.learningFormat === "workshop" || request.learningFormat === "mentoring" ? request.learningFormat : undefined,
    weeklyHours: request.weeklyHours === "undecided" ? undefined : Number(request.weeklyHours), interestSkillIds,
  });
  return { dataset, result };
}
