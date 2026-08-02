import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, IndianRupee, Bookmark, BookmarkCheck, Share2, Flag } from "lucide-react";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { SkeletonCard } from "../../components/ui/Skeleton.jsx";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(({ data }) => {
      setJob(data.job);
      setSaved(data.job.savedBy?.includes(user?._id));
      setLoading(false);
    });
  }, [id, user]);

  const toggleSave = async () => {
    const { data } = await api.put(`/jobs/${id}/save`);
    setSaved(data.saved);
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: job.title, url });
    else await navigator.clipboard.writeText(url);
  };

  const report = async () => {
    await api.put(`/jobs/${id}/report`);
    setReported(true);
  };

  if (loading) return <SkeletonCard />;
  if (!job) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <Link to="/jobs" className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
        <ArrowLeft size={16} /> Back to Jobs
      </Link>

      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-surface text-lg font-bold text-ink-700 overflow-hidden">
            {job.companyLogo ? <img src={job.companyLogo} alt="" className="h-full w-full object-cover" /> : job.companyName?.[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink-900">{job.title}</h1>
            <p className="text-sm text-ink-500">{job.companyName}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-surface p-4 sm:grid-cols-4">
          <Stat icon={IndianRupee} label="Stipend" value={job.salary} />
          <Stat icon={MapPin} label="Location" value={job.location} />
          <Stat icon={Calendar} label="Apply by" value={new Date(job.deadline).toLocaleDateString()} />
          <Stat label="Job Type" value={job.jobType} />
        </div>

        <div className="mt-5">
          <h2 className="text-sm font-semibold text-ink-900">Eligibility</h2>
          <p className="mt-1 text-sm text-ink-500">{job.eligibility}</p>
        </div>

        <div className="mt-5">
          <h2 className="text-sm font-semibold text-ink-900">About the Role</h2>
          <p className="mt-1 whitespace-pre-line text-sm text-ink-500">{job.description}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href={job.applicationLink} target="_blank" rel="noreferrer" className="btn-primary">Apply Now</a>
          <button onClick={toggleSave} className="btn-secondary">
            {saved ? <BookmarkCheck size={16} className="text-primary-600" /> : <Bookmark size={16} />}
            {saved ? "Saved" : "Save Job"}
          </button>
          <button onClick={share} className="btn-secondary"><Share2 size={16} /> Share</button>
          <button onClick={report} disabled={reported} className="btn-ghost text-rose-500 ml-auto">
            <Flag size={15} /> {reported ? "Reported" : "Report Expired Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs text-ink-500">{Icon && <Icon size={12} />} {label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink-900">{value}</p>
    </div>
  );
}
