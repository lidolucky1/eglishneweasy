import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Flame, Menu, X } from "lucide-react";
import { useState } from "react";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground font-black shadow-[0_3px_0_0_var(--color-primary-shadow)]">
            E
          </div>
          <span className="font-display text-xl font-extrabold tracking-tight">Englingo</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/courses" className="text-sm font-bold hover:text-primary">Courses</Link>
          <Link to="/courses" search={{ category: "listening" }} className="text-sm font-bold hover:text-primary">Podcasts</Link>
          <Link to="/courses" search={{ category: "grammar" }} className="text-sm font-bold hover:text-primary">Grammar</Link>
          {user && <Link to="/dashboard" className="text-sm font-bold hover:text-primary">Dashboard</Link>}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-3 py-1 text-xs font-extrabold text-warning-foreground">
                <Flame className="h-3.5 w-3.5" /> 0
              </span>
              <button onClick={() => signOut()} className="btn-pop-outline px-4 py-2">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn-pop-outline px-4 py-2">Log in</Link>
              <Link to="/auth" search={{ mode: "signup" }} className="btn-pop px-4 py-2">Get started</Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t-2 border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link to="/courses" onClick={() => setOpen(false)} className="font-bold">Courses</Link>
            {user && <Link to="/dashboard" onClick={() => setOpen(false)} className="font-bold">Dashboard</Link>}
            {user ? (
              <button onClick={() => { signOut(); setOpen(false); }} className="btn-pop-outline">Sign out</button>
            ) : (
              <>
                <Link to="/auth" onClick={() => setOpen(false)} className="btn-pop-outline">Log in</Link>
                <Link to="/auth" search={{ mode: "signup" }} onClick={() => setOpen(false)} className="btn-pop">Get started</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
