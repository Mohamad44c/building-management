import { cn } from '@/lib/utils'

export type BarListItem = {
  id: string
  label: string
  value: number
  detail?: string
  muted?: boolean
}

/** Ranked horizontal bars with label + value — responsive, readable, no chart library needed. */
export function BarList({
  items,
  format,
  barClassName = 'bg-[#2a78d6] dark:bg-[#3987e5]',
}: {
  items: BarListItem[]
  format: (value: number) => string
  barClassName?: string
}) {
  const max = Math.max(...items.map((item) => item.value), 0)
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const share = total > 0 ? (item.value / total) * 100 : 0
        return (
          <li key={item.id} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className={cn('min-w-0 truncate font-medium', item.muted && 'text-muted-foreground')} title={item.label}>
                {item.label}
              </span>
              <span className="shrink-0 tabular-nums">
                <span className="font-semibold">{format(item.value)}</span>
                <span className="ml-2 text-xs text-muted-foreground">{share.toFixed(0)}%</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
              <div
                className={cn('h-full rounded-full transition-[width] duration-500', item.muted ? 'bg-muted-foreground/40' : barClassName)}
                style={{ width: `${max > 0 ? Math.max((item.value / max) * 100, item.value > 0 ? 1.5 : 0) : 0}%` }}
              />
            </div>
            {item.detail ? <p className="text-xs text-muted-foreground">{item.detail}</p> : null}
          </li>
        )
      })}
    </ul>
  )
}
