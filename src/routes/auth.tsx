import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";

type Search = { mode?: "login" | "signup"; redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    mode: s.mode === "signup" ? "signup" : "login",
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode, redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: redirect ?? "/dashboard" });
  }, [user, navigate, redirect]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { name }, emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("Account created! Redirecting…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (r.error) toast.error(r.error.message);
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-12">
        <h1 className="font-display text-4xl font-extrabold">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {mode === "signup" ? "Free forever. No credit card." : "Log in to continue learning."}
        </p>

        <button onClick={google} className="btn-pop-outline mt-6 w-full">
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input
              required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl border-2 border-border bg-card px-4 py-3 font-bold outline-none focus:border-primary"
            />
          )}
          <input
            required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-2xl border-2 border-border bg-card px-4 py-3 font-bold outline-none focus:border-primary"
          />
          <input
            required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border-2 border-border bg-card px-4 py-3 font-bold outline-none focus:border-primary"
          />
          <button disabled={loading} type="submit" className="btn-pop w-full disabled:opacity-60">
            {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-bold text-muted-foreground">
          {mode === "signup" ? "Already have an account? " : "New here? "}
          <Link
            to="/auth"
            search={{ mode: mode === "signup" ? "login" : "signup" }}
            className="text-primary"
          >
            {mode === "signup" ? "Log in" : "Sign up"}
          </Link>
        </p>
      </main>
    </>
  );
}
