import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { normalizeSong } from "../../utils/normalizeSong";

const ALL_GENRES = [
  "Pop",
  "Rock",
  "Hip-Hop",
  "R&B",
  "Electronic",
  "Classical",
  "Jazz",
  "Indie",
  "Folk",
  "Bollywood",
  "Acoustic",
  "Metal",
  "Lo-Fi",
  "Other",
];

const ALL_MOODS = [
  "Devotional",
  "Melancholic",
  "Peaceful",
  "Joyful",
  "Energetic",
  "Romantic",
  "Nostalgic",
  "Focus",
];

export function EditSongModal({ song, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    title: song.title || "",
    description: song.description || "",
    genre: song.genre || "",
    mood: song.mood || "",
    visibility: song.visibility || "public",
  });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(
    normalizeSong(song).coverUrl,
  );
  const [saving, setSaving] = useState(false);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const songId = song._id || song.id;
      const API = import.meta.env.VITE_API_URL;

      const res = await fetch(`${API}/api/music/${songId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      let data = await res.json();
      let updated = data.music || data;

      if (coverFile) {
        const fd = new FormData();
        fd.append("cover", coverFile);
        const coverRes = await fetch(`/api/music/${songId}/cover`, {
          method: "POST",
          credentials: "include",
          body: fd,
        });
        if (coverRes.ok) {
          const coverData = await coverRes.json();
          updated = coverData.music || coverData;
        }
      }

      toast.success("Song updated");
      onSaved(updated);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface-dark border border-border-dark rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">Edit Song</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Cover preview + upload */}
        <div className="flex items-start gap-4 mb-5">
          <div
            className="relative w-24 h-24 rounded-xl overflow-hidden bg-border-dark flex-shrink-0 group cursor-pointer"
            onClick={() => document.getElementById("edit-cover-upload").click()}
          >
            {coverPreview ? (
              <img
                src={coverPreview}
                className="w-full h-full object-cover"
                alt=""
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-primary/40">
                  music_note
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="material-symbols-outlined text-white">
                photo_camera
              </span>
            </div>
          </div>
          <input
            id="edit-cover-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
          />
          <div className="flex-1 space-y-3">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                Title *
              </label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Song title"
                className="w-full bg-charcoal border border-border-dark rounded-lg px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                Visibility
              </label>
              <select
                value={form.visibility}
                onChange={(e) =>
                  setForm((f) => ({ ...f, visibility: e.target.value }))
                }
                className="w-full bg-charcoal border border-border-dark rounded-lg px-3 py-2.5 text-white text-sm cursor-pointer focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="public" className="bg-charcoal text-white">
                  Public
                </option>
                <option value="draft" className="bg-charcoal text-white">
                  Draft
                </option>
                <option value="private" className="bg-charcoal text-white">
                  Private
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
              Genre
            </label>
            <select
              value={form.genre}
              onChange={(e) =>
                setForm((f) => ({ ...f, genre: e.target.value }))
              }
              className="w-full bg-charcoal border border-border-dark rounded-lg px-3 py-2.5 text-white text-sm cursor-pointer focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="" className="bg-charcoal text-white">
                Select genre...
              </option>
              {ALL_GENRES.map((g) => (
                <option key={g} value={g} className="bg-charcoal text-white">
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
              Mood
            </label>
            <select
              value={form.mood}
              onChange={(e) => setForm((f) => ({ ...f, mood: e.target.value }))}
              className="w-full bg-charcoal border border-border-dark rounded-lg px-3 py-2.5 text-white text-sm cursor-pointer focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="" className="bg-charcoal text-white">
                Select mood...
              </option>
              {ALL_MOODS.map((m) => (
                <option key={m} value={m} className="bg-charcoal text-white">
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              placeholder="Describe your song..."
              className="w-full bg-charcoal border border-border-dark rounded-lg px-3 py-2.5 text-white text-sm resize-none focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-border-dark text-slate-300 py-2.5 rounded-full hover:bg-border-dark transition-colors cursor-pointer text-sm"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 bg-primary text-background-dark font-bold py-2.5 rounded-full hover:bg-primary/90 active:scale-95 transition-all cursor-pointer disabled:opacity-50 text-sm"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
