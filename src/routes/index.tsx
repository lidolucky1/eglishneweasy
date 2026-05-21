import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CourseCard, type CourseCardData } from "@/components/CourseCard";
import heroImg from "@/assets/hero-learning.jpg";
import { Sparkles, Headphones, Trophy, Globe2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Englingo — Learn English with Interactive Lessons" },
      { name: "description", content: "Videos, podcasts, and quizzes across CEFR A1–C2. Start free." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const { data: featured } = useQuery({
    queryKey: ["featured-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id,title,slug,description,level,category,hero_color,lessons_count")
        .order("created_at", { ascending: true })
        .limit(6);
      if (error) throw error;
      return data as CourseCardData[];
    },
  });

  const { data: podcasts } = useQuery({
    queryKey: ["podcasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id,title,slug,description,level,category,hero_color,lessons_count")
        .eq("category", "listening");
      if (error) throw error;
      return data as CourseCardData[];
    },
  });

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card/70 px-3 py-1 text-xs font-extrabold uppercase">
                <Sparkles className="h-3.5 w-3.5 text-warning" /> New • Free to start
              </span>
              <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.05] md:text-6xl">
                Learn English with <span className="text-primary">Interactive</span> Lessons
              </h1>
              <p className="mt-5 max-w-lg text-lg text-muted-foreground">
                Bite-sized videos, real podcasts, vocabulary and quizzes. Built for CEFR levels A1 to C2 — and your morning commute.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/auth" search={{ mode: "signup" }} className="btn-pop px-7 py-4 text-base">Start Learning</Link>
                <Link to="/courses" className="btn-pop-outline px-7 py-4 text-base">Explore Courses</Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-6 text-sm font-bold text-muted-foreground">
                <span className="inline-flex items-center gap-2"><Globe2 className="h-4 w-4 text-secondary" /> 10 courses</span>
                <span className="inline-flex items-center gap-2"><Headphones className="h-4 w-4 text-secondary" /> Podcasts & audio</span>
                <span className="inline-flex items-center gap-2"><Trophy className="h-4 w-4 text-warning" /> Quizzes & streaks</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 rounded-[3rem] bg-primary/10 blur-2xl" />
              <img
                src={heroImg}
                alt="Student learning English with Englingo"
                className="relative w-full rounded-[2rem] border-2 border-border shadow-2xl"
                loading="eager"
              />
            </div>
          </div>
        </section>

        {/* Featured courses */}
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-extrabold">Featured courses</h2>
              <p className="mt-1 text-muted-foreground">Hand-picked starting points for every level.</p>
            </div>
            <Link to="/courses" className="text-sm font-extrabold text-primary">See all →</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured?.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </section>

        {/* Podcasts */}
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="font-display text-3xl font-extrabold">Podcasts & listening</h2>
                <p className="mt-1 text-muted-foreground">Train your ears with real-speed English.</p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {podcasts?.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          </div>
        </section>

        {/* Levels strip */}
        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="font-display text-3xl font-extrabold">Find your level</h2>
          <p className="mt-1 text-muted-foreground">CEFR levels from absolute beginner to mastery.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(["A1","A2","B1","B2","C1","C2"] as const).map((lvl) => (
              <Link
                key={lvl}
                to="/courses"
                search={{ level: lvl }}
                className="card-pop text-center"
              >
                <div className="font-display text-3xl font-extrabold text-primary">{lvl}</div>
                <div className="mt-1 text-xs font-bold text-muted-foreground">{levelLabel(lvl)}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="font-display text-3xl font-extrabold">Loved by learners</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                { q: "I finally understand podcasts at normal speed. Game changer.", a: "Sofia, B1 learner" },
                { q: "The quizzes are addictive. I do 3 every morning with coffee.", a: "Tariq, A2 learner" },
                { q: "Best business English course I've used. Practical and short.", a: "Maxime, B2 learner" },
              ].map((t) => (
                <figure key={t.a} className="card-pop">
                  <blockquote className="font-display text-lg leading-snug">"{t.q}"</blockquote>
                  <figcaption className="mt-3 text-sm font-bold text-muted-foreground">— {t.a}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function levelLabel(lvl: string) {
  return { A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper-Int.", C1: "Advanced", C2: "Mastery" }[lvl];
}
