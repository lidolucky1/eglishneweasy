import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LevelBadge } from "@/components/LevelBadge";
import { Clock, Play } from "lucide-react";

export const Route = createFileRoute("/courses/$slug")({
  component: CourseDetail,
});

function CourseDetail() {
  const { slug } = Route.useParams();

  const { data: course } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses").select("*").eq("slug", slug).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: lessons } = useQuery({
    queryKey: ["lessons", course?.id],
    enabled: !!course?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id,title,slug,order_index,duration_min")
        .eq("course_id", course!.id)
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  if (!course) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-4xl px-4 py-20">Loading…</main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main>
        <section
          className="border-b-2 border-border"
          style={{ background: `linear-gradient(135deg, ${course.hero_color ?? "#58CC02"}22, transparent)` }}
        >
          <div className="mx-auto max-w-5xl px-4 py-12">
            <div className="flex items-center gap-3">
              <LevelBadge level={course.level} />
              <span className="text-xs font-extrabold uppercase text-muted-foreground">{course.category}</span>
            </div>
            <h1 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">{course.title}</h1>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{course.description}</p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-10">
          <h2 className="text-2xl font-extrabold">Lessons ({lessons?.length ?? 0})</h2>
          <ol className="mt-6 space-y-3">
            {lessons?.map((l, i) => (
              <li key={l.id}>
                <Link
                  to="/lessons/$id"
                  params={{ id: l.id }}
                  className="card-pop flex items-center gap-4"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 font-extrabold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-extrabold">{l.title}</div>
                    <div className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {l.duration_min} min
                    </div>
                  </div>
                  <Play className="h-5 w-5 text-primary" />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
