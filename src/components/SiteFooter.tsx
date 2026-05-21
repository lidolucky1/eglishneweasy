export function SiteFooter() {
  return (
    <footer className="mt-24 border-t-2 border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground font-black shadow-[0_3px_0_0_var(--color-primary-shadow)]">E</div>
            <span className="font-display text-xl font-extrabold">Englingo</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Learn English with bite-sized lessons, podcasts, and quizzes — at your pace, on any device.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-extrabold uppercase">Learn</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Grammar</li><li>Vocabulary</li><li>Listening</li><li>Speaking</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-extrabold uppercase">Levels</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>A1 — Beginner</li><li>A2 — Elementary</li><li>B1 — Intermediate</li><li>C1 — Advanced</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-extrabold uppercase">Newsletter</h4>
          <p className="text-sm text-muted-foreground">One weekly lesson, free.</p>
          <form className="mt-3 flex gap-2">
            <input type="email" placeholder="you@email.com" className="w-full rounded-2xl border-2 border-border bg-card px-3 py-2 text-sm" />
            <button type="button" className="btn-pop px-4 py-2 text-xs">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t-2 border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Englingo. Built with love.
      </div>
    </footer>
  );
}
