import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  ChevronDown,
  LogOut,
  UserCircle,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios.js";

export default function Navbar({
  onMenuClick,
  searchPlaceholder = "Search anything...",
}) {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("cc_theme");
    if (stored) return stored === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("cc_theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    api
      .get("/notifications")
      .then(({ data }) => setNotifications(data.notifications || []))
      .catch(() => setNotifications([]));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
  };

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-surface-border bg-surface/80 backdrop-blur px-4 py-3 sm:px-6">
      <button onClick={onMenuClick} className="btn-ghost !p-2 lg:hidden">
        <Menu size={20} />
      </button>

      <div className="relative flex-1 max-w-md">
        <Search
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
        />
        <input className="input-field pl-9" placeholder={searchPlaceholder} />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => setDark((d) => !d)}
          className="btn-ghost !p-2.5"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="btn-ghost relative !p-2.5"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="card absolute right-0 mt-2 w-80 p-2 animate-fade-in">
              <p className="px-2 py-1.5 text-sm font-semibold text-ink-900">
                Notifications
              </p>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="px-2 py-6 text-center text-sm text-ink-400">
                    You're all caught up.
                  </p>
                )}
                {notifications.slice(0, 8).map((n) => (
                  <button
                    key={n._id}
                    onClick={() => markRead(n._id)}
                    className={`flex w-full items-start gap-2 rounded-xl px-2 py-2.5 text-left hover:bg-surface ${
                      !n.read ? "bg-primary-50/60" : ""
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${!n.read ? "bg-primary-500" : "bg-transparent"}`}
                    />
                    <span>
                      <span className="block text-sm font-medium text-ink-900">
                        {n.title}
                      </span>
                      <span className="block text-xs text-ink-500">
                        {n.message}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-surface"
          >
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.fullName || "U")}`
              }
              alt={user?.fullName}
              className="h-8 w-8 rounded-full object-cover"
            />
            <ChevronDown size={15} className="hidden text-ink-400 sm:block" />
          </button>
          {profileOpen && (
            <div className="card absolute right-0 mt-2 w-56 p-2 animate-fade-in">
              <div className="px-2 py-2">
                <p className="text-sm font-semibold text-ink-900">
                  {user?.fullName}
                </p>
                <p className="truncate text-xs text-ink-500">{user?.email}</p>
              </div>
              <div className="my-1 border-t border-surface-border" />
              <Link
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink-700 hover:bg-surface"
              >
                <UserCircle size={16} /> Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink-700 hover:bg-surface"
              >
                <Settings size={16} /> Settings
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-rose-600 hover:bg-rose-50"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
