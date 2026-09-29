import { useId, type ReactNode } from 'react'

export type DashboardSectionProps = {
  title: string
  description?: string
  /** Shown next to the title, e.g. whether the section follows the period filter. */
  meta?: ReactNode
  children: ReactNode
}

export function DashboardSection({ title, description, meta, children }: DashboardSectionProps) {
  const headingId = useId()

  return (
    <section className="scroll-mt-40 space-y-3 sm:space-y-4" aria-labelledby={headingId}>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div className="space-y-0.5">
          <h2 id={headingId} className="text-lg font-semibold tracking-tight">
            {title}
          </h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {meta ? <div className="text-xs text-muted-foreground">{meta}</div> : null}
      </div>
      {children}
    </section>
  )
}
