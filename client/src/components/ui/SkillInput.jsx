import { useState } from "react"
import { X } from "lucide-react"

export default function SkillInput({ label, skills, onChange }) {
  const [value, setValue] = useState("")

  const addSkill = () => {
    const trimmed = value.trim()
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed])
    }
    setValue("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addSkill()
    }
  }

  const removeSkill = (skill) => {
    onChange(skills.filter((s) => s !== skill))
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--color-text-primary)]">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] p-2 focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]/20">
        {skills.map((skill) => (
          <span
            key={skill}
            className="flex items-center gap-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-medium px-3 py-1"
          >
            {skill}
            <button type="button" onClick={() => removeSkill(skill)}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addSkill}
          placeholder={skills.length === 0 ? "Type a skill and press Enter" : ""}
          className="flex-1 min-w-[120px] outline-none text-sm px-1 py-1"
        />
      </div>
    </div>
  )
}