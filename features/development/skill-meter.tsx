export function SkillMeter({ name, current, required, critical = false }: { name: string; current: number; required: number; critical?: boolean }) {
  return <div className="space-y-2.5">
    <div className="flex items-center justify-between gap-4 text-sm"><span className="font-medium">{name}</span><span className="shrink-0 text-xs tabular-nums text-muted-foreground">{current} <span className="text-muted-foreground/60">/ {required} для цели</span></span></div>
    <div className="flex gap-1.5" role="meter" aria-label={name} aria-valuenow={current} aria-valuemin={0} aria-valuemax={5} aria-valuetext={`${current} из 5, требуется ${required}`}>
      {[1, 2, 3, 4, 5].map((level) => <div key={level} className={`h-2 flex-1 rounded-full ${level <= current ? "bg-primary" : level <= required ? "bg-primary/20" : "bg-muted"}`} />)}
    </div>
    {critical && current < required && <p className="text-[11px] text-muted-foreground">Ключевой навык для выбранной цели</p>}
  </div>;
}
