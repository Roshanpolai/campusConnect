export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center animate-fade-in">
      {Icon && (
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-50 text-primary-600">
          <Icon size={26} strokeWidth={1.75} />
        </div>
      )}
      <div>
        <p className="text-base font-semibold text-ink-900">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
