import { createGoalPolicy } from "./policies/goal";
import { defaultRecommendationPolicy } from "./recommendations/policy";

/** Application composition point. Core functions also accept policies explicitly for experiments. */
export const developmentPolicy = {
  goal: createGoalPolicy("next_grade"),
  recommendations: defaultRecommendationPolicy,
};
