import { cn } from "../../lib/utils"

const variants = {
  primary: "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]",
  secondary: "bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-gray-200 border border-[var(--color-border)]",
  ghost: "bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
}

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base"
}

export default function Button({ variant = "primary", size = "md", className, children, ...props }) {
  return (
    <button
      className={cn(
        "rounded-[var(--radius-control)] font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}