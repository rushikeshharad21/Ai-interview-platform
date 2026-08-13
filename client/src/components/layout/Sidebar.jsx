import { NavLink } from "react-router-dom"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

export default function Sidebar({ items, isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
        />
      )}

      <aside
        aria-label="Main navigation"
        className={cn(
          "fixed md:static top-4 bottom-4 left-4 md:top-auto md:bottom-auto md:left-auto z-40 w-60 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4 transition-transform duration-200 overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+2rem)] md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between mb-4 md:hidden">
          <span className="font-semibold text-[var(--color-text-primary)]">Menu</span>
          <button onClick={onClose} aria-label="Close menu" className="text-[var(--color-text-secondary)]">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-control)] text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                )
              }
            >
              <item.icon size={18} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}