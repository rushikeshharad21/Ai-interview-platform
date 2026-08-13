import { useId } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

export default function Select({ label, error, options, icon: Icon, className, id, ...props }) {
  const generatedId = useId()
  const selectId = id || generatedId
  const errorId = `${selectId}-error`

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-[var(--color-text-primary)]">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none"
            aria-hidden="true"
          />
        )}
        <select
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full appearance-none rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-primary)] px-4 py-2.5 text-sm outline-none transition-all duration-150 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20",
            Icon && "pl-9",
            error && "border-[var(--color-error)]",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none"
          aria-hidden="true"
        />
      </div>
      {error && (
        <span id={errorId} role="alert" className="text-xs text-[var(--color-error)]">
          {error}
        </span>
      )}
    </div>
  )
}