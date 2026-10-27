// Every page under /judge renders inside this <main>, so pages return their
// content only. Judging is a work surface, so it uses the compact density
// (redesign > Density). A layout is never the authorization check (docs/07 >
// Route groups): every judge page and action calls requireRole("JUDGE") itself.
export default function JudgeLayout({ children }: LayoutProps<"/judge">) {
  return (
    <main data-density="compact" className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8">
      {children}
    </main>
  );
}
