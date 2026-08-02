import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`card relative w-full ${widths[size]} max-h-[90vh] overflow-y-auto p-6 animate-fade-in`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
          <button onClick={onClose} className="btn-ghost !p-1.5" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
