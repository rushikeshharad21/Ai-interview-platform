import { LogOut, User, Menu } from "lucide-react"

export default function Navbar({ userName, onLogout, onMenuClick }) {
  return (
    <header className="h-16 shrink-0 rounded-2xl bg-white border border-[var(--color-border)] shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-[var(--color-text-secondary)]"
        >
          <Menu size={22} />
        </button>
        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white font-semibold text-sm">
          AI
        </div>
        <span className="font-semibold text-[var(--color-text-primary)] hidden sm:inline">
          Interview Platform
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <User size={16} />
          <span>{userName}</span>
        </div>
        <div className="hidden sm:block w-px h-5 bg-[var(--color-border)]" />
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-colors duration-150"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}