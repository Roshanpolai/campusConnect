import { useEffect, useState } from "react";
import { Search, MapPin, Calendar, Clock, Users, PartyPopper } from "lucide-react";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { SkeletonGrid } from "../../components/ui/Skeleton.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";

const CATEGORIES = ["All", "Technical", "Cultural", "Sports", "Workshop"];

export default function Events() {
  const { user } = useAuth();
  const [tab, setTab] = useState("all");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = { category, search };
    if (tab === "registered") {
      params.mine = "true";
      params.userId = user?._id;
    }
    api
      .get("/events", { params })
      .then(({ data }) => setEvents(data.events || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, category, search]);

  const toggleRegister = async (id) => {
    const { data } = await api.put(`/events/${id}/register`);
    setEvents((prev) => prev.map((e) => (e._id === id ? data.event : e)));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Events</h1>
          <p className="text-sm text-ink-500">Discover and register for campus happenings.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." className="input-field pl-9" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 rounded-xl bg-surface-card border border-surface-border p-1">
          <button onClick={() => setTab("all")} className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${tab === "all" ? "bg-primary-gradient text-white shadow-glow" : "text-ink-500 hover:text-ink-900"}`}>
            All Events
          </button>
          <button onClick={() => setTab("registered")} className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${tab === "registered" ? "bg-primary-gradient text-white shadow-glow" : "text-ink-500 hover:text-ink-900"}`}>
            My Registrations
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-pill px-3.5 py-1.5 text-xs font-medium border transition-colors ${
                category === c ? "bg-primary-500 border-primary-500 text-white" : "border-surface-border text-ink-500 hover:border-primary-300 hover:text-primary-600"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : events.length === 0 ? (
        <EmptyState icon={PartyPopper} title="No events found" description="Try a different filter or check back later." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => {
            const registered = ev.registeredStudents?.includes(user?._id);
            return (
              <div key={ev._id} className="card overflow-hidden group">
                <div className="relative h-36 w-full overflow-hidden bg-primary-gradient">
                  {ev.banner && <img src={ev.banner} alt={ev.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
                  <span className="absolute left-3 top-3 badge bg-white/90 text-ink-700">{ev.category}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-ink-900">{ev.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-500">{ev.description}</p>
                  <div className="mt-3 space-y-1.5 text-xs text-ink-500">
                    <p className="flex items-center gap-1.5"><MapPin size={13} /> {ev.venue}</p>
                    <p className="flex items-center gap-1.5"><Calendar size={13} /> {new Date(ev.date).toLocaleDateString()}</p>
                    <p className="flex items-center gap-1.5"><Clock size={13} /> {ev.time}</p>
                    <p className="flex items-center gap-1.5"><Users size={13} /> {ev.participantsCount ?? ev.registeredStudents?.length ?? 0} going</p>
                  </div>
                  <button
                    onClick={() => toggleRegister(ev._id)}
                    className={registered ? "btn-secondary w-full mt-4" : "btn-primary w-full mt-4"}
                  >
                    {registered ? "Registered ✓" : "Register"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
