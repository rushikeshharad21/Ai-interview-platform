import { LogOut, User, Menu } from "lucide-react"
import ThemeToggle from "../ui/ThemeToggle.jsx"

export default function Navbar({ userName, userAvatar, onLogout, onMenuClick }) {
  return (
    <header className="h-16 shrink-0 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex items-center justify-between px-4 md:px-6">
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

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <User size={16} />
          )}
          <span>{userName}</span>
        </div>
        <ThemeToggle />
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-sm text-[var(--color-accent)] border border-[var(--color-accent)] rounded-[var(--radius-control)] px-3 py-1.5 hover:bg-[var(--color-accent)] hover:text-white transition-colors duration-150"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}