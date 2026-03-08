import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNotification } from "../context/NotificationContext";
import { uploadMusic } from "../api/music";

const GENRES = [
    "Pop", "Rock", "Hip-Hop", "R&B", "Electronic", "Classical", "Jazz",
    "Indie", "Folk", "Bollywood", "Acoustic", "Metal", "Lo-Fi", "Other"
];
const LANGUAGES = [
    "Hindi", "English", "Tamil", "Telugu", "Bengali", "Punjabi",
    "Marathi", "Sanskrit", "Instrumental", "Other",
];
const MOODS = [
    "Devotional", "Melancholic", "Peaceful", "Joyful",
    "Energetic", "Romantic", "Nostalgic", "Focus"
];

export default function ArtistUpload() {
    const { user, profile } = useAuth();
    const toast = useToast();
    const { addNotification, updateNotification } = useNotification();
    const navigate = useNavigate();
    const audioInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const [step, setStep] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    const [form, setForm] = useState({
        title: "",
        genre: "",
        language: "",
        mood: "",
        description: "",
        lyrics: "",
        visibility: "public",
    });

    const hasAvatar = !!profile.avatarUrl;

    const handleAudioSelect = (e) => {
        const file = e.target.files[0];
        if (file) setAudioFile(file);
    };

    const handleCoverSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setCoverPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };



    const handleSubmit = async () => {
        if (!form.title.trim()) {
            toast.error("Please enter a track title");
            return;
        }
        if (!audioFile) {
            toast.error("Please select an audio file");
            return;
        }

        // Fire and forget upload
        const notifId = addNotification({
            type: "uploading",
            title: `Uploading "${form.title}"...`,
            message: "Your song is being processed and securely stored.",
            status: "loading"
        });

        // Close upload window immediately
        toast.info("Upload started in the background!");
        navigate("/studio");

        try {
            await uploadMusic(
                {
                    title: form.title,
                    file: audioFile,
                    coverImage: coverFile,
                    genre: form.genre,
                    mood: form.mood,
                    description: form.description,
                    visibility: form.visibility
                },
                (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    updateNotification(notifId, {
                        progress: percentCompleted,
                        message: percentCompleted < 100 ? `Uploading... ${percentCompleted}%` : "Processing file..."
                    });
                }
            );
            updateNotification(notifId, {
                title: `"${form.title}" uploaded successfully!`,
                message: "Your track is now live on your profile.",
                status: "success",
                type: "success"
            });
        } catch (err) {
            console.error(err);
            updateNotification(notifId, {
                title: `Failed to upload "${form.title}"`,
                message: err.response?.data?.message || "Upload failed. Please try again.",
                status: "error",
                type: "error"
            });
        }
    };

    if (!hasAvatar) {
        return (
            <div className="px-6 md:px-10 py-8 max-w-3xl mx-auto page-enter">
                <div className="bg-surface-dark rounded-2xl border border-border-dark p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-amber-400 text-4xl">warning</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Profile Photo Required</h2>
                    <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
                        You need to add a profile photo before you can upload songs. This helps listeners discover and trust your music.
                    </p>
                    <button
                        onClick={() => navigate("/profile")}
                        className="px-6 py-2.5 rounded-full bg-primary text-background-dark font-semibold text-sm hover:shadow-[0_0_15px_rgba(244,195,47,0.4)] transition-all"
                    >
                        Go to Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 md:px-10 py-8 max-w-6xl mx-auto page-enter">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">Upload Song</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left — Media Assets */}
                <div className="space-y-6">
                    {/* Cover Art */}
                    <div className="bg-surface-dark rounded-2xl border border-border-dark p-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Cover Art</h3>
                        <div
                            onClick={() => coverInputRef.current?.click()}
                            className="aspect-square rounded-xl border-2 border-dashed border-border-dark hover:border-primary/50 transition-colors cursor-pointer overflow-hidden flex items-center justify-center bg-charcoal group"
                        >
                            {coverPreview ? (
                                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-center p-6">
                                    <span className="material-symbols-outlined text-4xl text-slate-500 group-hover:text-primary/50 transition-colors">
                                        add_photo_alternate
                                    </span>
                                    <p className="text-sm text-slate-400">Click to upload cover art</p>
                                    <p className="text-xs text-slate-500">3000×3000px, JPG or PNG</p>
                                </div>
                            )}
                        </div>
                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCoverSelect}
                            className="hidden"
                        />
                    </div>

                    {/* Audio File */}
                    <div className="bg-surface-dark rounded-2xl border border-border-dark p-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Audio File</h3>
                        {audioFile ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 bg-charcoal rounded-lg p-3">
                                    <span className="material-symbols-outlined text-primary">audio_file</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{audioFile.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                                        </p>
                                    </div>
                                    <span className="text-xs font-medium text-green-400 bg-green-900/50 px-2 py-0.5 rounded">
                                        Ready
                                    </span>
                                </div>

                                {/* Waveform visualization */}
                                <div className="flex items-end justify-center gap-[3px] h-8 px-2">
                                    {Array.from({ length: 30 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="waveform-bar"
                                            style={{ animationDelay: `${i * 0.05}s` }}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={() => setAudioFile(null)}
                                    className="text-xs text-red-400 hover:underline"
                                >
                                    Remove File
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => audioInputRef.current?.click()}
                                className="w-full py-8 rounded-xl border-2 border-dashed border-border-dark hover:border-primary/50 transition-colors flex flex-col items-center gap-2 group"
                            >
                                <span className="material-symbols-outlined text-3xl text-slate-500 group-hover:text-primary/50">
                                    upload_file
                                </span>
                                <p className="text-sm text-slate-400">Upload audio file</p>
                                <p className="text-xs text-slate-500">MP3, WAV, FLAC</p>
                            </button>
                        )}
                        <input
                            ref={audioInputRef}
                            type="file"
                            accept="audio/*"
                            onChange={handleAudioSelect}
                            className="hidden"
                        />
                    </div>

                </div>

                {/* Right — Upload Details */}
                <div className="bg-surface-dark rounded-2xl border border-border-dark p-6 md:p-8">
                    {/* Step indicators */}
                    <div className="flex items-center gap-2 mb-8">
                        {[1, 2, 3].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStep(s)}
                                className={`w-3 h-3 rounded-full transition-colors ${step === s ? "bg-primary" : "bg-border-dark hover:bg-slate-500"
                                    }`}
                            />
                        ))}
                        <span className="text-xs text-slate-500 ml-2">
                            Step {step} of 3 — {step === 1 ? "Basic Info" : step === 2 ? "Metadata" : "Content"}
                        </span>
                    </div>

                    {/* Step 1 - Basic Info */}
                    {step === 1 && (
                        <div className="space-y-5 animate-fade-in">
                            <h3 className="text-lg font-bold text-white">Basic Info</h3>
                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
                                    Track Title *
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Enter track title"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-charcoal border border-border-dark text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
                                    Primary Artist *
                                </label>
                                <input
                                    type="text"
                                    value={user?.username || ""}
                                    readOnly
                                    className="w-full px-4 py-3 rounded-xl bg-charcoal/50 border border-border-dark text-slate-400 text-sm cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
                                    Featuring Artists
                                </label>
                                <input
                                    type="text"
                                    placeholder="Type to search and add artists..."
                                    className="w-full px-4 py-3 rounded-xl bg-charcoal border border-border-dark text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                                />
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!form.title.trim()}
                                className="w-full py-3 rounded-full bg-primary text-background-dark font-semibold text-sm hover:shadow-[0_0_15px_rgba(244,195,47,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Next: Metadata
                            </button>
                        </div>
                    )}

                    {/* Step 2 - Metadata */}
                    {step === 2 && (
                        <div className="space-y-5 animate-fade-in">
                            <h3 className="text-lg font-bold text-white">Metadata</h3>
                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
                                    Genre *
                                </label>
                                <select
                                    value={form.genre}
                                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-charcoal border border-border-dark text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                                >
                                    <option value="" className="bg-surface-dark text-white">Select genre</option>
                                    {GENRES.map((g) => (
                                        <option key={g} value={g} className="bg-surface-dark text-white">{g}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
                                    Language
                                </label>
                                <select
                                    value={form.language}
                                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-charcoal border border-border-dark text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                                >
                                    <option value="" className="bg-surface-dark text-white">Select language</option>
                                    {LANGUAGES.map((l) => (
                                        <option key={l} value={l} className="bg-surface-dark text-white">{l}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
                                    Mood
                                </label>
                                <select
                                    value={form.mood}
                                    onChange={(e) => setForm({ ...form, mood: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-charcoal border border-border-dark text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                                >
                                    <option value="" className="bg-surface-dark text-white">Select mood</option>
                                    {MOODS.map((m) => (
                                        <option key={m} value={m} className="bg-surface-dark text-white">{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 rounded-full border border-border-dark text-slate-300 font-medium text-sm hover:bg-surface-dark transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="flex-1 py-3 rounded-full bg-primary text-background-dark font-semibold text-sm hover:shadow-[0_0_15px_rgba(244,195,47,0.4)] transition-all"
                                >
                                    Next: Content
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3 - Content */}
                    {step === 3 && (
                        <div className="space-y-5 animate-fade-in">
                            <h3 className="text-lg font-bold text-white">Content</h3>
                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    placeholder="Tell listeners about this track..."
                                    className="w-full px-4 py-3 rounded-xl bg-charcoal border border-border-dark text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
                                    Lyrics (optional)
                                </label>
                                <textarea
                                    value={form.lyrics}
                                    onChange={(e) => setForm({ ...form, lyrics: e.target.value })}
                                    rows={4}
                                    placeholder="Add lyrics..."
                                    className="w-full px-4 py-3 rounded-xl bg-charcoal border border-border-dark text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
                                    Visibility
                                </label>
                                <div className="flex gap-3">
                                    {["public", "draft", "private"].map((v) => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => setForm({ ...form, visibility: v })}
                                            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${form.visibility === v
                                                ? "bg-primary/20 border-primary text-primary"
                                                : "bg-charcoal border-border-dark text-slate-400 hover:border-slate-500"
                                                }`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-3 rounded-full border border-border-dark text-slate-300 font-medium text-sm hover:bg-surface-dark transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={uploading || !form.title || !audioFile}
                                    className="flex-1 py-3 rounded-full bg-primary text-background-dark font-semibold text-sm hover:shadow-[0_0_15px_rgba(244,195,47,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Uploading...
                                        </span>
                                    ) : (
                                        "Upload Song"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
