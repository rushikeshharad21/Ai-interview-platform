import { cn } from "../../lib/utils"

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}