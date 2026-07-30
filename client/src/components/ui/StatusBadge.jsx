import { cn } from "../../lib/utils"

const statusStyles = {
  applied: "bg-blue-50 text-blue-600",
  shortlisted: "bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
  interview_scheduled: "bg-amber-50 text-amber-600",
  rejected: "bg-red-50 text-[var(--color-error)]",
  hired: "bg-green-50 text-[var(--color-success)]",
  scheduled: "bg-amber-50 text-amber-600",
  completed: "bg-green-50 text-[var(--color-success)]",
  cancelled: "bg-red-50 text-[var(--color-error)]"
}

const statusLabels = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  interview_scheduled: "Interview Scheduled",
  rejected: "Rejected",
  hired: "Hired",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled"
}

export default function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full text-xs font-medium px-2.5 py-1",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  )
}