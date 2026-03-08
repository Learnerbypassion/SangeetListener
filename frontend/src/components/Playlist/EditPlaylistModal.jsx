import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useToast } from "../../context/ToastContext";
import api from "../../api/axiosInstance";

const GENRES = [
    "Pop", "Rock", "Hip-Hop", "R&B", "Electronic", "Classical", "Jazz",
    "Indie", "Folk", "Bollywood", "Acoustic", "Metal", "Lo-Fi", "Other"
];

export default function EditPlaylistModal({ playlist, onClose, onUpdate, onDelete }) {
    const toast = useToast();
    const coverInputRef = useRef(null);
    const [title, setTitle] = useState(playlist.name || "");
    const [description, setDescription] = useState(playlist.description || "");
    const [genre, setGenre] = useState(playlist.genre || "");
    const [isPublic, setIsPublic] = useState(playlist.isPublic || false);
    const [coverPreview, setCoverPreview] = useState(playlist.coverUrl || null);
    const [coverFile, setCoverFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleCoverSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setCoverPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Please enter a playlist title");
            return;
        }

        setLoading(true);

        try {
            // First update text metadata
            const res = await api.put(`/api/playlists/${playlist._id}`, {
                name: title.trim(),
                description: description.trim(),
                genre: genre,
                isPublic: isPublic
            });

            // Then upload cover image if modified
            if (coverFile) {
                const formData = new FormData();
                formData.append("cover", coverFile);
                await api.put(`/api/playlists/${playlist._id}/cover`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }

            toast.success("Playlist updated successfully");
            window.dispatchEvent(new Event("playlistUpdate"));
            onUpdate({ name: title, description, genre, isPublic });
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update playlist");
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-surface-dark border border-border-dark rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-border-dark">
                    <h3 className="text-lg font-bold text-white">Edit Playlist</h3>
                    <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                    {/* Cover Art selection */}
                    <div className="flex gap-4 items-center">
                        <div
                            onClick={() => coverInputRef.current?.click()}
                            className="w-24 h-24 rounded-lg bg-charcoal border-2 border-dashed border-border-dark hover:border-primary/50 transition-colors flex justify-center items-center cursor-pointer overflow-hidden flex-shrink-0 group"
                        >
                            {coverPreview ? (
                                <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors text-3xl">add_photo_alternate</span>
                            )}
                        </div>
                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCoverSelect}
                            className="hidden"
                        />
                        <div className="flex-1">
                            <h4 className="text-white font-medium text-sm mb-1">Playlist Logo <span className="text-slate-500 text-xs font-normal">(Optional)</span></h4>
                            <p className="text-xs text-slate-400 leading-snug">Choose a cover image for your playlist. We recommend a square image at least 300x300 pixels.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Title *</label>
                            <input
                                autoFocus
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-charcoal border border-border-dark text-white rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-sm"
                                placeholder="My awesome playlist"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Description <span className="lowercase font-normal">(optional)</span></label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                className="w-full bg-charcoal border border-border-dark text-white rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-sm resize-none"
                                placeholder="What's this playlist about?"
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Genre <span className="lowercase font-normal">(optional)</span></label>
                                <select
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    className="w-full bg-charcoal border border-border-dark text-white rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-sm"
                                >
                                    <option value="" className="bg-charcoal text-white">Select genre</option>
                                    {GENRES.map((g) => (
                                        <option key={g} value={g} className="bg-charcoal text-white">{g}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1 flex flex-col justify-center translate-y-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                        className="accent-primary w-4 h-4 cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-white select-none">Make Public</span>
                                </label>
                                <p className="text-xs text-slate-400 ml-7 mt-0.5">Visible on your public profile</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 mt-6 border-t border-border-dark items-center justify-between">
                        {!confirmDelete ? (
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(true)}
                                className="text-red-500 font-medium text-sm hover:underline cursor-pointer"
                            >
                                Delete Playlist
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-red-500 pr-1">Are you sure?</span>
                                <button
                                    type="button"
                                    onClick={onDelete}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-xs font-bold cursor-pointer"
                                >
                                    Yes, delete
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(false)}
                                    className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors text-xs font-medium cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 rounded-full border border-border-dark text-slate-300 font-semibold cursor-pointer hover:bg-surface-dark transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!title.trim() || loading}
                                className="px-6 py-2 rounded-full bg-primary text-background-dark font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(244,195,47,0.4)] transition-all flex items-center gap-2"
                            >
                                {loading && <span className="material-symbols-outlined text-sm animate-spin">refresh</span>}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
