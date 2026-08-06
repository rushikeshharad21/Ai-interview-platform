import { useState } from "react"
import { Outlet } from "react-router-dom"
import { LayoutDashboard, Briefcase, Calendar, FileText } from "lucide-react"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"

const candidateNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Browse Jobs", icon: Briefcase },
  { to: "/interviews", label: "My Interviews", icon: Calendar }
]

const recruiterNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs/manage", label: "My Jobs", icon: Briefcase },
  { to: "/applications", label: "Applications", icon: FileText },
  { to: "/interviews/manage", label: "Interviews", icon: Calendar }
]

export default function AppLayout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navItems = user?.role === "recruiter" ? recruiterNav : candidateNav

  return (
    <div className="h-screen bg-[var(--color-surface)] p-4 flex flex-col gap-4">
      <Navbar
        userName={user?.name}
        onLogout={onLogout}
        onMenuClick={() => setSidebarOpen(true)}
      />
      <div className="flex-1 flex gap-4 min-h-0">
        <Sidebar
          items={navItems}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0 rounded-2xl bg-white border border-[var(--color-border)] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}