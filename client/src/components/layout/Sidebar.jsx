import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  PartyPopper,
  Briefcase,
  Store,
  Search,
  Users,
  MessageSquareText,
  UserCircle,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/academic", label: "Academic", icon: CalendarDays },
  { to: "/events", label: "Events", icon: PartyPopper },
  { to: "/jobs", label: "Jobs & Internships", icon: Briefcase },
  { to: "/marketplace", label: "Marketplace", icon: Store },
  { to: "/lost-found", label: "Lost & Found", icon: Search },
  { to: "/team-finder", label: "Team Finder", icon: Users },
  { to: "/feedback", label: "Feedback", icon: MessageSquareText },
  { to: "/profile", label: "Profile", icon: UserCircle },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ mobileOpen, onClose }) {
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
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">CampusConnect</p>
            <p className="text-[11px] text-ink-400 leading-tight">All-in-one campus platform</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
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
