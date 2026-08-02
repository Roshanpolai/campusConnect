const VARIANTS = {
  core: "bg-primary-50 text-primary-700",
  elective: "bg-emerald-50 text-emerald-700",
  lab: "bg-amber-50 text-amber-700",
  active: "bg-emerald-50 text-emerald-700",
  expired: "bg-rose-50 text-rose-700",
  pending: "bg-amber-50 text-amber-700",
  reviewed: "bg-emerald-50 text-emerald-700",
  blocked: "bg-rose-50 text-rose-700",
  neutral: "bg-surface text-ink-500",
};

export default function Badge({ children, variant = "neutral", className = "" }) {
  return <span className={`badge ${VARIANTS[variant] || VARIANTS.neutral} ${className}`}>{children}</span>;
}
