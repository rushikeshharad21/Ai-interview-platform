import { cn } from "../../lib/utils"

const variants = {
  default: "bg-[var(--color-surface)] text-[var(--color-text-secondary)]",
  accent: "bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
  success: "bg-[var(--color-success)]/10 text-[var(--color-success)]"
}

export default function Badge({ variant = "default", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full text-xs font-medium px-2.5 py-1",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}