import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import api from "../../api/axios.js";

// Uploads a document (PDF/Word/PPT/ZIP — no video, enforced server-side) to
// Cloudinary as a raw asset and reports the full result back to the parent,
// so it can be attached to a Resource / Timetable / Profile record.
export default function FileUploadField({ value, onChange, folder = "documents", label = "File", accept = ".pdf,.doc,.docx,.ppt,.pptx,.zip" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post(`/uploads/document?folder=${folder}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange({
        fileUrl: data.url,
        cloudinaryPublicId: data.publicId,
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try a different file.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      {label && <label className="label-field">{label}</label>}
      {value?.fileName ? (
        <div className="flex items-center gap-3 rounded-xl border border-surface-border p-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600">
            <FileText size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-900">{value.fileName}</p>
            <p className="text-xs text-ink-500">{(value.fileSize / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button type="button" onClick={() => onChange(null)} className="btn-ghost !p-2">
            <X size={15} className="text-rose-500" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-surface-border py-6 text-sm text-ink-500 hover:border-primary-300 hover:text-primary-600"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? "Uploading..." : "Click to upload a file"}
        </button>
      )}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
