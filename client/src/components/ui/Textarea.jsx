import { useId } from "react"
import { cn } from "../../lib/utils"

export default function Textarea({ label, error, className, id, ...props }) {
  const generatedId = useId()
  const textareaId = id || generatedId
  const errorId = `${textareaId}-error`

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-[var(--color-text-primary)]">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] px-4 py-2.5 text-sm outline-none transition-all duration-150 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 resize-none",
          error && "border-[var(--color-error)]",
          className
        )}
        {...props}
      />
      {error && (
        <span id={errorId} role="alert" className="text-xs text-[var(--color-error)]">
          {error}
        </span>
      )}
    </div>
  )
}