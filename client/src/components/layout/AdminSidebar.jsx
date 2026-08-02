import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  PartyPopper,
  Briefcase,
  Store,
  Search,
  MessageSquareText,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/academic", label: "Academic", icon: CalendarDays },
  { to: "/admin/events", label: "Events", icon: PartyPopper },
  { to: "/admin/jobs", label: "Jobs & Internships", icon: Briefcase },
  { to: "/admin/marketplace", label: "Marketplace", icon: Store },
  { to: "/admin/lost-found", label: "Lost & Found", icon: Search },
  { to: "/admin/feedback", label: "Feedback", icon: MessageSquareText },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({ mobileOpen, onClose }) {
  const { logout } = useAuth();

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-ink-900/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-sidebar-gradient px-4 py-6 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 px-2 pb-6">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-gradient text-white shadow-glow">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">CampusConnect</p>
            <p className="text-[11px] text-ink-400 leading-tight">Super Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) => (isActive ? "sidebar-link-active" : "sidebar-link")}
            >
              <Icon size={18} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button onClick={logout} className="sidebar-link mt-2 w-full text-left">
          <LogOut size={18} strokeWidth={1.75} />
          Logout
        </button>
      </aside>
    </>
  );
}
