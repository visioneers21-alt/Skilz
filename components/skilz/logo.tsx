import { cn } from '@/lib/utils'

export function SkilzMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-[0.55em] bg-primary text-primary-foreground',
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-[62%] w-[62%]" fill="none">
        {/* three ascending sparks — discovery / growth */}
        <path
          d="M6 16.5c2.2 0 3-1.2 3-3.4"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <path
          d="M12 18.5V8.2c0-1.3 1-2.4 2.4-2.4 1.3 0 2.4 1 2.4 2.3 0 1.5-1.1 2.3-2.6 2.3H12"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export function SkilzLogo({
  className,
  showSubtitle = false,
}: {
  className?: string
  showSubtitle?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <SkilzMark className="h-8 w-8 text-lg" />
      <div className="flex flex-col leading-none">
        <span className="font-display text-lg font-extrabold tracking-tight">
          SKILZ
        </span>
        {showSubtitle && (
          <span className="text-[11px] font-medium text-muted-foreground">
            Personal Skill Planner
          </span>
        )}
      </div>
    </div>
  )
}
