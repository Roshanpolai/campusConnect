import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Bookmark, BookmarkCheck, MapPin, Briefcase } from "lucide-react";
import api from "../../api/axios.js";
import Badge from "../../components/ui/Badge.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { SkeletonGrid } from "../../components/ui/Skeleton.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const TYPES = ["All", "Internship", "Full Time", "Remote", "Freelance", "Referral"];

export default function Jobs() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("All");
  const [sort, setSort] = useState("latest");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/jobs", { params: { search, jobType, sort } })
      .then(({ data }) => setJobs(data.jobs || []))
      .finally(() => setLoading(false));
  }, [search, jobType, sort]);

  const toggleSave = async (id, e) => {
    e.preventDefault();
    const { data } = await api.put(`/jobs/${id}/save`);
    setJobs((prev) =>
      prev.map((j) =>
        j._id === id
          ? { ...j, savedBy: data.saved ? [...(j.savedBy || []), user._id] : (j.savedBy || []).filter((s) => s !== user._id) }
          : j
      )
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Jobs & Internships</h1>
          <p className="text-sm text-ink-500">Off-campus roles, internships, and referrals shared by the community.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="input-field pl-9" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setJobType(t)}
              className={`rounded-pill px-3.5 py-1.5 text-xs font-medium border transition-colors ${
                jobType === t ? "bg-primary-500 border-primary-500 text-white" : "border-surface-border text-ink-500 hover:border-primary-300 hover:text-primary-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field w-auto text-sm">
          <option value="latest">Sort: Latest</option>
          <option value="deadline">Sort: Deadline</option>
        </select>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs found" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => {
            const saved = job.savedBy?.includes(user?._id);
            const expiringSoon = new Date(job.deadline) - new Date() < 3 * 24 * 60 * 60 * 1000;
            return (
              <Link key={job._id} to={`/jobs/${job._id}`} className="card p-5 hover:shadow-card transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-surface text-sm font-bold text-ink-700 overflow-hidden">
                      {job.companyLogo ? <img src={job.companyLogo} alt="" className="h-full w-full object-cover" /> : job.companyName?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-ink-900 leading-tight">{job.companyName}</p>
                      <p className="text-xs text-ink-500">{job.title}</p>
                    </div>
                  </div>
                  <button onClick={(e) => toggleSave(job._id, e)} className="text-ink-400 hover:text-primary-600">
                    {saved ? <BookmarkCheck size={18} className="text-primary-600" /> : <Bookmark size={18} />}
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant="core">{job.jobType}</Badge>
                  <Badge variant="neutral">{job.workMode}</Badge>
                  {job.pinned && <Badge variant="pending">Pinned</Badge>}
                </div>

                <div className="mt-3 space-y-1 text-xs text-ink-500">
                  <p className="flex items-center gap-1.5"><MapPin size={13} /> {job.location}</p>
                  <p>{job.salary}</p>
                  <p className={expiringSoon ? "text-rose-600 font-medium" : ""}>
                    Apply by {new Date(job.deadline).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
