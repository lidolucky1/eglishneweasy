import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Flame, Trophy, BookOpen, Heart } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "login", redirect: "/dashboard" } });
  }, [loading, user, navigate]);

  const { data: profile } = useQuery({
    enabled: !!user,
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      return data;
    },
  });

  const { data: progress } = useQuery({
    enabled: !!user,
    queryKey: ["progress", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("progress")
        .select("score, completed, lesson_id, last_seen_at, lessons(title, courses(title, slug))")
        .eq("user_id", user!.id)
        .order("last_seen_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  const { data: favs } = useQuery({
    enabled: !!user,
    queryKey: ["favs", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("favorites")
        .select("lesson_id, lessons(title, courses(title, slug))")
        .eq("user_id", user!.id);
      return data ?? [];
    },
  });

  if (loading || !user) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-4xl px-4 py-20">Loading…</main>
      </>
    );
  }

  const completed = progress?.filter((p) => p.completed).length ?? 0;
  const avgScore = progress?.length
    ? Math.round(progress.reduce((s, p) => s + (p.score ?? 0), 0) / progress.length)
    : 0;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold">
              Hello, {profile?.name ?? "learner"} 👋
            </h1>
            <p className="mt-1 text-muted-foreground">Your CEFR level: <strong>{profile?.level ?? "A1"}</strong></p>
          </div>
          <Link to="/courses" className="btn-pop">Continue learning</Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={<Flame className="h-5 w-5" />} label="Streak" value={`${profile?.streak ?? 0} days`} tint="bg-warning/15 text-warning-foreground" />
          <Stat icon={<Trophy className="h-5 w-5" />} label="XP" value={String(profile?.xp ?? 0)} tint="bg-primary/15 text-primary" />
          <Stat icon={<BookOpen className="h-5 w-5" />} label="Lessons done" value={String(completed)} tint="bg-secondary/15 text-secondary" />
          <Stat icon={<Trophy className="h-5 w-5" />} label="Avg quiz" value={`${avgScore}`} tint="bg-accent/20 text-accent-foreground" />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="text-xl font-extrabold">Recent activity</h2>
            <ul className="mt-4 space-y-3">
              {progress?.length ? progress.map((p) => (
                <li key={p.lesson_id}>
                  <Link to="/lessons/$id" params={{ id: p.lesson_id }} className="card-pop block">
                    <div className="text-xs font-bold uppercase text-muted-foreground">{p.lessons?.courses?.title}</div>
                    <div className="font-extrabold">{p.lessons?.title}</div>
                    {p.score != null && <div className="mt-1 text-sm text-primary">Score: {p.score}</div>}
                  </Link>
                </li>
              )) : <li className="text-sm text-muted-foreground">No activity yet — start a lesson!</li>}
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-extrabold"><Heart className="h-5 w-5 text-destructive" /> Favorites</h2>
            <ul className="mt-4 space-y-3">
              {favs?.length ? favs.map((f) => (
                <li key={f.lesson_id}>
                  <Link to="/lessons/$id" params={{ id: f.lesson_id }} className="card-pop block">
                    <div className="text-xs font-bold uppercase text-muted-foreground">{f.lessons?.courses?.title}</div>
                    <div className="font-extrabold">{f.lessons?.title}</div>
                  </Link>
                </li>
              )) : <li className="text-sm text-muted-foreground">Save lessons by tapping the heart on any lesson.</li>}
            </ul>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Stat({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: string; tint: string }) {
  return (
    <div className="card-pop">
      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold ${tint}`}>{icon} {label}</div>
      <div className="mt-3 font-display text-3xl font-extrabold">{value}</div>
    </div>
  );
}
