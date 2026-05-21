import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CourseCard, type CourseCardData } from "@/components/CourseCard";
import { Search } from "lucide-react";

type Search = {
  level?: string;
  category?: string;
  q?: string;
};

export const Route = createFileRoute("/courses")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    level: typeof s.level === "string" ? s.level : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Courses — Englingo" },
      { name: "description", content: "Browse every English course by CEFR level and category." },
    ],
    links: [{ rel: "canonical", href: "/courses" }],
  }),
  component: CoursesPage,
});

const LEVELS = ["A1","A2","B1","B2","C1","C2"] as const;
const CATEGORIES = [
  "grammar","vocabulary","pronunciation","listening","speaking",
  "reading","writing","business","news","ielts",
] as const;

function CoursesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? "");

  const { data } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id,title,slug,description,level,category,hero_color,lessons_count")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as CourseCardData[];
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((c) => {
      if (search.level && c.level !== search.level) return false;
      if (search.category && c.category !== search.category) return false;
      if (q && !c.title.toLowerCase().includes(q.toLowerCase()) && !c.description?.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [data, search, q]);

  const setSearch = (next: Partial<Search>) => navigate({ search: (prev: Search) => ({ ...prev, ...next }) });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="font-display text-4xl font-extrabold">All courses</h1>
        <p className="mt-1 text-muted-foreground">Filter by CEFR level and category.</p>

        {/* Search */}
        <div className="mt-6 flex items-center gap-2 rounded-2xl border-2 border-border bg-card px-4 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search courses…"
            className="w-full bg-transparent py-2 text-sm outline-none"
          />
        </div>

        {/* Filters */}
        <div className="mt-5 flex flex-wrap gap-2">
          <Chip active={!search.level} onClick={() => setSearch({ level: undefined })}>All levels</Chip>
          {LEVELS.map((l) => (
            <Chip key={l} active={search.level === l} onClick={() => setSearch({ level: l })}>{l}</Chip>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip active={!search.category} onClick={() => setSearch({ category: undefined })}>All topics</Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={search.category === c} onClick={() => setSearch({ category: c })}>
              <span className="capitalize">{c}</span>
            </Chip>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
        {filtered.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">No courses match your filters.</p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border-2 px-3 py-1.5 text-xs font-extrabold uppercase transition ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"
      }`}
    >
      {children}
    </button>
  );
}
