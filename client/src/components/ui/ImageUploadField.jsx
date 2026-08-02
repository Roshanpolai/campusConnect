import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import api from "../../api/axios.js";

// Uploads an image to Cloudinary via the backend and reports the resulting
// URL back to the parent form. `folder` groups assets in Cloudinary
// (avatars, events, marketplace, lostfound, jobs...).
export default function ImageUploadField({ value, onChange, folder = "general", label = "Image", shape = "square" }) {
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
      formData.append("image", file);
      const { data } = await api.post(`/uploads/image?folder=${folder}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(data.url);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try a different image.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const shapeClass = shape === "round" ? "rounded-full" : "rounded-xl";

  return (
    <div>
      {label && <label className="label-field">{label}</label>}
      <div className="flex items-center gap-3">
        <div className={`relative h-20 w-20 shrink-0 overflow-hidden border border-surface-border bg-surface ${shapeClass}`}>
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-ink-400">
              <Camera size={20} />
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 grid place-items-center bg-ink-900/40">
              <Loader2 size={18} className="animate-spin text-white" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-secondary !py-1.5 text-xs">
            {uploading ? "Uploading..." : value ? "Change image" : "Upload image"}
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600">
              <X size={12} /> Remove
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
