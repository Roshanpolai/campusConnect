import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  PartyPopper,
  Briefcase,
  Clock,
  MapPin,
  ArrowUpRight,
  FileText,
  Download,
  Bell,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios.js";
import { SkeletonGrid } from "../../components/ui/Skeleton.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);
  const [events, setEvents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      api.get("/schedule"),
      api.get("/events"),
      api.get("/jobs"),
      api.get("/marketplace"),
      api.get("/notifications"),
    ]).then(([s, e, j, p, n]) => {
      if (s.status === "fulfilled") setSchedule(s.value.data.schedule);
      if (e.status === "fulfilled") setEvents(e.value.data.events || []);
      if (j.status === "fulfilled") setJobs(j.value.data.jobs || []);
      if (p.status === "fulfilled") setProducts(p.value.data.products || []);
      if (n.status === "fulfilled")
        setNotifications(n.value.data.notifications || []);
      setLoading(false);
    });
  }, []);

  const upcomingEvents = events.slice(0, 3);
  const latestJobs = jobs.slice(0, 3);
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const stats = [
    {
      label: "Timetable",
      value: schedule ? "Available" : "Not yet",
      icon: CalendarDays,
      tint: "bg-primary-50 text-primary-600",
      to: "/academic",
    },
    {
      label: "Upcoming Events",
      value: events.length,
      icon: PartyPopper,
      tint: "bg-rose-50 text-rose-600",
      to: "/events",
    },
    {
      label: "New Job Posts",
      value: jobs.length,
      icon: Briefcase,
      tint: "bg-sky-50 text-sky-600",
      to: "/jobs",
    },
    {
      label: "Unread Notifications",
      value: unreadNotifications,
      icon: Bell,
      tint: "bg-amber-50 text-amber-600",
      to: "/notifications",
    },
  ];

  const hour = new Date().getHours();

  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  if (loading) return <SkeletonGrid count={8} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">
          Hi, {user?.fullName?.split(" ")[0]}
        </h1>
        <p className="text-sm text-ink-500">
          {greeting}! Have a productive day.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tint, to }) => (
          <Link
            key={label}
            to={to}
            className="card group p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300"
          >
            <div
              className={`grid h-10 w-10 place-items-center rounded-xl ${tint}`}
            >
              <Icon size={19} />
            </div>

            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-ink-900">{value}</p>

                <p className="text-sm text-ink-500">{label}</p>
              </div>

              <ArrowUpRight
                size={16}
                className="text-ink-400 opacity-0 transition-opacity group-hover:opacity-100"
              />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Timetable" actionTo="/academic">
          {!schedule ? (
            <EmptyState
              icon={CalendarDays}
              title="No timetable published yet"
              description="Check back once your admin uploads it."
            />
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-surface-border p-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600">
                <FileText size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">
                  {schedule.fileName}
                </p>
                <p className="truncate text-xs text-ink-500">
                  {user?.department} · {user?.year}
                  {user?.section ? ` · Sec ${user.section}` : ""}
                </p>
              </div>
              <a
                href={schedule.fileUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="btn-ghost !p-2"
              >
                <Download size={16} />
              </a>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Upcoming Events" actionTo="/events">
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={PartyPopper}
              title="No events yet"
              description="Check back soon for campus events."
            />
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((ev) => (
                <div
                  key={ev._id}
                  className="flex items-center gap-3 rounded-xl border border-surface-border p-3"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-600">
                    <PartyPopper size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">
                      {ev.name}
                    </p>
                    <p className="truncate text-xs text-ink-500">
                      {new Date(ev.date).toLocaleDateString()} · {ev.venue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Latest Job Posts" actionTo="/jobs">
          {latestJobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs posted yet"
              description="Opportunities will show up here."
            />
          ) : (
            <div className="space-y-3">
              {latestJobs.map((job) => (
                <div
                  key={job._id}
                  className="flex items-center gap-3 rounded-xl border border-surface-border p-3"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600 text-xs font-bold">
                    {job.companyName?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">
                      {job.title}
                    </p>
                    <p className="truncate text-xs text-ink-500">
                      {job.companyName} · {job.salary}
                    </p>
                  </div>
                  <MapPin size={14} className="shrink-0 text-ink-400" />
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Recent Notifications" actionTo={null}>
          {notifications.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Nothing new"
              description="You're all caught up."
            />
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 4).map((n) => (
                <div
                  key={n._id}
                  className="flex items-start gap-3 rounded-xl border border-surface-border p-3"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.read ? "bg-primary-500" : "bg-surface-border"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">
                      {n.title}
                    </p>
                    <p className="truncate text-xs text-ink-500">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {products.length > 0 && (
        <SectionCard title="Marketplace Highlights" actionTo="/marketplace">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <Link key={p._id} to="/marketplace" className="group">
                <div className="aspect-square overflow-hidden rounded-xl bg-surface">
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-2 truncate text-sm font-medium text-ink-900">
                  {p.name}
                </p>
                <p className="text-xs text-primary-600 font-semibold">
                  ₹{p.price}
                </p>
              </Link>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function SectionCard({ title, actionTo, children }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
        {actionTo && (
          <Link
            to={actionTo}
            className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            View All <ArrowUpRight size={13} />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}
