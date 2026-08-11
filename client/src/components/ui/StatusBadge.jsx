import { cn } from "../../lib/utils"

const statusStyles = {
  applied: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  shortlisted: "bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
  interview_scheduled: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  rejected: "bg-red-50 text-[var(--color-error)] dark:bg-red-500/15",
  hired: "bg-green-50 text-[var(--color-success)] dark:bg-green-500/15",
  scheduled: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  completed: "bg-green-50 text-[var(--color-success)] dark:bg-green-500/15",
  cancelled: "bg-red-50 text-[var(--color-error)] dark:bg-red-500/15"
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