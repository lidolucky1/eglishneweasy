const colors: Record<string, string> = {
  A1: "bg-level-a1/30 text-emerald-900 dark:text-emerald-100",
  A2: "bg-level-a2/30 text-teal-900 dark:text-teal-100",
  B1: "bg-level-b1/30 text-sky-900 dark:text-sky-100",
  B2: "bg-level-b2/30 text-indigo-900 dark:text-indigo-100",
  C1: "bg-level-c1/30 text-fuchsia-900 dark:text-fuchsia-100",
  C2: "bg-level-c2/30 text-rose-900 dark:text-rose-100",
};

export function LevelBadge({ level }: { level: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold ${colors[level] ?? "bg-muted text-foreground"}`}>
      {level}
    </span>
  );
}
