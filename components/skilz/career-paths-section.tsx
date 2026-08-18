import type { CareerPath } from '@/lib/career/paths'

export function CareerPathsSection({ paths }: { paths: CareerPath[] }) {
  if (paths.length === 0) return null

  return (
    <section id="career-paths" className="scroll-mt-8">
      <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
        Possible areas to explore
      </h2>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        Based on your potential profile — starting points for research, WAEC subject choices, and
        conversations with teachers or mentors. Not guaranteed career outcomes.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {paths.map((path) => (
          <article
            key={path.id}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <h3 className="font-display text-lg font-bold">{path.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {path.hook}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Matched: {path.matchedSkills.join(', ')}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
