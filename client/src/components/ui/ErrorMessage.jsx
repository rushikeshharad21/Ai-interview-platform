import { AlertCircle } from "lucide-react"

export default function ErrorMessage({ children, className = "" }) {
  if (!children) return null

  return (
    <div
      role="alert"
      className={`flex items-start gap-2 text-sm text-[var(--color-error)] bg-red-50 dark:bg-red-500/15 rounded-[var(--radius-control)] p-3 ${className}`}
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>
  )
}