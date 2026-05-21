import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { QuizPlayer } from "@/components/QuizPlayer";
import { useAuth } from "@/lib/auth-context";
import { Heart, BookOpen, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/lessons/$id")({
  component: LessonPage,
});

function LessonPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: lesson } = useQuery({
    queryKey: ["lesson", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("lessons").select("*, courses(title,slug)").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: quizzes } = useQuery({
    queryKey: ["quizzes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes").select("id,question,options,answer,explanation,type").eq("lesson_id", id).order("order_index");
      if (error) throw error;
      return data.map((q) => ({ ...q, options: q.options as string[] }));
    },
  });

  const { data: fav } = useQuery({
    queryKey: ["fav", id, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("favorites").select("id").eq("lesson_id", id).eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const toggleFav = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to save favorites");
      if (fav) {
        await supabase.from("favorites").delete().eq("id", fav.id);
      } else {
        await supabase.from("favorites").insert({ user_id: user.id, lesson_id: id });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fav", id, user?.id] });
      toast.success(fav ? "Removed from favorites" : "Added to favorites");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveScore = useMutation({
    mutationFn: async (score: number) => {
      if (!user) return;
      await supabase.from("progress").upsert(
        { user_id: user.id, lesson_id: id, completed: true, score, last_seen_at: new Date().toISOString() },
        { onConflict: "user_id,lesson_id" },
      );
    },
  });

  if (!lesson) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-4xl px-4 py-20">Loading…</main>
      </>
    );
  }

  const vocab = (lesson.vocabulary as Array<{ word: string; def: string }>) ?? [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="text-xs font-extrabold uppercase text-muted-foreground">
          {lesson.courses?.title}
        </div>
        <div className="mt-2 flex items-start justify-between gap-4">
          <h1 className="font-display text-4xl font-extrabold">{lesson.title}</h1>
          <button
            onClick={() => toggleFav.mutate()}
            className={`rounded-2xl border-2 p-3 transition ${fav ? "border-destructive bg-destructive/10 text-destructive" : "border-border hover:border-destructive"}`}
            aria-label="Toggle favorite"
          >
            <Heart className={`h-5 w-5 ${fav ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Video / Audio placeholder */}
        <div className="mt-6 aspect-video w-full overflow-hidden rounded-3xl border-2 border-border bg-gradient-to-br from-primary/20 to-secondary/20">
          {lesson.video_url ? (
            <video src={lesson.video_url} controls className="h-full w-full" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <BookOpen className="mr-2 h-6 w-6" /> Video coming soon
            </div>
          )}
        </div>

        {lesson.audio_url && (
          <audio src={lesson.audio_url} controls className="mt-4 w-full" />
        )}

        {/* Content + transcript */}
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="flex items-center gap-2 text-xl font-extrabold"><FileText className="h-5 w-5" /> Lesson</h2>
            <p className="mt-3 text-base leading-relaxed">{lesson.content}</p>

            {lesson.transcript && (
              <details className="mt-6 rounded-2xl border-2 border-border bg-card p-4">
                <summary className="cursor-pointer font-extrabold">Transcript</summary>
                <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{lesson.transcript}</p>
              </details>
            )}
          </div>

          <aside>
            <h3 className="text-lg font-extrabold">Vocabulary</h3>
            <ul className="mt-3 space-y-2">
              {vocab.map((v) => (
                <li key={v.word} className="rounded-2xl border-2 border-border bg-card p-3">
                  <div className="font-extrabold text-primary">{v.word}</div>
                  <div className="text-sm text-muted-foreground">{v.def}</div>
                </li>
              ))}
              {!vocab.length && <li className="text-sm text-muted-foreground">No vocabulary added.</li>}
            </ul>
          </aside>
        </section>

        {/* Quiz */}
        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-extrabold">Quiz</h2>
          <QuizPlayer quizzes={quizzes ?? []} onComplete={(s) => saveScore.mutate(s)} />
          {!user && <p className="mt-3 text-sm text-muted-foreground">Sign in to save your progress and score.</p>}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
