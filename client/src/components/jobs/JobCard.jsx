import { useState } from "react"
import { MapPin, Calendar, Building2, Bookmark } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Card from "../ui/Card"
import Badge from "../ui/Badge"

const employmentLabels = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship"
}

export default function JobCard({ job }) {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)

  return (
    <Card
      onClick={() => navigate(`/jobs/${job._id}`)}
      className="cursor-pointer flex flex-col gap-4 transition-all duration-150 hover:border-[var(--color-accent)]/40 hover:shadow-[0_8px_24px_rgba(79,70,229,0.12)] hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
            <Building2 size={18} className="text-[var(--color-accent)]" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)] leading-tight">
              {job.title}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {job.recruiter?.name}
            </p>
          </div>
        </div>
        <Badge variant="accent">{employmentLabels[job.employmentType]}</Badge>
      </div>

      <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {job.requiredSkills.slice(0, 4).map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
        {job.requiredSkills.length > 4 && (
          <Badge>+{job.requiredSkills.length - 4} more</Badge>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1">
            <MapPin size={14} aria-hidden="true" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} aria-hidden="true" />
            {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setSaved(!saved)
          }}
          aria-label={saved ? "Remove from saved jobs" : "Save this job"}
          aria-pressed={saved}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors duration-150"
        >
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} className={saved ? "text-[var(--color-accent)]" : ""} aria-hidden="true" />
        </button>
      </div>
    </Card>
  )
}