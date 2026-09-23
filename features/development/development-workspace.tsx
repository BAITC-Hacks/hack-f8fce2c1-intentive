"use client";

import Link from "next/link";
import { useDevelopment, useRecommendations, useUserStore } from "@/components/providers/user-store-provider";
import { selectProfile } from "@/stores/selectors";
import { Badge } from "@/components/ui/badge";

const emptyMessages = {
  goal_requirements_met: "You meet the skill requirements for this target. You can choose another goal in your preferences.",
  no_goal_improving_activity: "Available activities do not currently reduce the skill gaps for your target.",
  no_available_activity: "No activities currently meet your participation requirements. Check your active learning and upcoming sessions.",
};

export function DevelopmentWorkspace() {
  const profile = useUserStore(selectProfile);
  const events = useUserStore((state) => state.dataset.events);
  const development = useDevelopment();
  const result = useRecommendations();
  return <div className="mx-auto max-w-4xl space-y-8">
    <header className="space-y-2">
      <p className="text-sm text-muted-foreground">{profile.full_name}</p>
      <h1 className="text-2xl font-semibold">My development</h1>
      <p className="text-sm text-muted-foreground">{result.goal.target.target_grade} · {result.goal.target.target_role}</p>
      {(result.goal.source === "suggested_next_grade" || result.goal.source === "current_role") && <Badge variant="secondary">Suggested direction · no goal selected</Badge>}
    </header>
    <section className="rounded-xl border p-5" aria-label="Skill progress">
      <p className="text-2xl font-semibold">{Math.round(development.trajectory.target.coveragePercent)}% <span className="text-sm font-normal text-muted-foreground">of target skill requirements covered</span></p>
      <p className="mt-2 text-sm text-muted-foreground">{development.trajectory.target.criticalGaps.length} critical skill gaps. Skill coverage does not guarantee promotion.</p>
    </section>
    <section className="space-y-4">
      <div className="space-y-1"><h2 className="text-lg font-semibold">Your next step</h2><p className="text-sm text-muted-foreground">Choose one of these options. Each is evaluated against your current skills, target and participation history.</p><p className="text-xs text-muted-foreground">Calculated recommendations · AI explanations are not connected yet.</p></div>
      {result.emptyReason && <p className="rounded-xl border p-5 text-sm text-muted-foreground">{emptyMessages[result.emptyReason]}</p>}
      {result.recommendations.map((recommendation) => {
        const event = events.find((item) => item.event_id === recommendation.eventId)!;
        return <article key={event.event_id} className="space-y-4 rounded-xl border p-5">
          <div className="space-y-1"><h3 className="font-semibold">{event.title}</h3><p className="text-sm text-muted-foreground">{event.duration_hours} hours · {recommendation.evidence.nextSessionDate ? `Next session: ${recommendation.evidence.nextSessionDate}` : "Self-paced"}</p></div>
          <ul className="space-y-2 pl-4 text-sm text-muted-foreground list-disc">{recommendation.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
          <p className="text-sm">Projected skill coverage after completion: {Math.round(recommendation.projectedCoveragePercent)}%</p>
        </article>;
      })}
      <Link href="/activities" className="inline-flex text-sm underline underline-offset-4">View activities and current learning</Link>
    </section>
  </div>;
}
