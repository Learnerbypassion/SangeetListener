import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { listMusic } from "../api/music";
import SongCard from "../components/common/SongCard";
import { SkeletonGrid } from "../components/common/LoadingSpinner";
import { EditSongModal } from "../components/common/EditSongModal";
import { ConfirmModal } from "../components/common/ConfirmModal";

export default function ArtistDashboard() {
    const { user, profile, updateProfile } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("grid");
    const [editingSong, setEditingSong] = useState(null);
    const [deletingSong, setDeletingSong] = useState(null);

    const hasAvatar = !!profile.avatarUrl;
    const initials = user?.username?.slice(0, 2).toUpperCase() || "A";

    useEffect(() => {
        listMusic()
            .then((res) => {
                const allSongs = res.data.musics || [];
                // Filter to only the current artist's songs
                const mySongs = allSongs.filter(
                    (s) => s.artist?._id === user?.id || s.artist?.username === user?.username
                );
                setSongs(mySongs);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("avatar", file);

            try {
                await updateProfile(formData);
                toast.success("Profile photo updated!");
            } catch (err) {
                toast.error("Failed to update profile photo");
            }
        }
    };

    return (
        <div className="px-6 md:px-10 py-8 space-y-8 page-enter">
            {/* Profile Hero Card */}
            <div className="bg-surface-dark rounded-2xl border border-border-dark p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    {/* Avatar */}
                    <div className="relative group flex-shrink-0">
                        <div
                            className={`w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden flex items-center justify-center ${hasAvatar
                                ? "bg-surface-dark"
                                : "border-2 border-dashed border-slate-600"
                                }`}
                        >
                            {hasAvatar ? (
                                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-slate-500 text-3xl">add_a_photo</span>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
                        </button>
                        {!hasAvatar && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                !
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-white">{user?.username}</h1>
                            <span className="bg-primary/20 text-primary text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                                Artist
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">
                            Welcome to your dashboard! {profile.bio || "Share your music with the world."}
                        </p>

                        {!hasAvatar && (
                            <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-700/30 rounded-lg px-4 py-3 text-sm text-amber-200 mb-4">
                                <span className="material-symbols-outlined text-[18px]">warning</span>
                                Add a profile photo to unlock song uploads.
                            </div>
                        )}

                        {/* Stats */}
                        <div className="flex gap-8">
                            {[
                                { label: "Followers", value: "0" },
                                { label: "Uploads", value: songs.length.toString() },
                                { label: "Plays", value: "0" },
                            ].map((stat) => (
                                <div key={stat.label}>
                                    <p className="text-xl font-bold text-white">{stat.value}</p>
                                    <p className="text-xs text-slate-500">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>



            {/* Your Uploads */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-white">Your Uploads</h2>
                    <div className="flex items-center gap-1 bg-surface-dark rounded-lg p-0.5">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-border-dark text-white" : "text-slate-500 hover:text-white"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">grid_view</span>
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-border-dark text-white" : "text-slate-500 hover:text-white"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">view_list</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <SkeletonGrid count={8} />
                ) : songs.length > 0 ? (
                    viewMode === "grid" ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                            {songs.map((song) => (
                                <SongCard key={song._id} song={song} songList={songs} isOwner={true} showArtist={false} onEdit={setEditingSong} onDelete={setDeletingSong} />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {songs.map((song) => (
                                <div
                                    key={song._id}
                                    className="flex items-center gap-4 px-4 py-3 rounded-lg bg-surface-dark hover:bg-border-dark/50 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-charcoal flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-primary/40">music_note</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{song.title}</p>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase bg-green-900/50 text-green-300 px-2 py-0.5 rounded">
                                        Public
                                    </span>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 rounded-full bg-surface-dark/80 flex items-center justify-center mb-5">
                            <span className="material-symbols-outlined text-primary/30 text-5xl">cloud_upload</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Upload your first song</h3>
                        <p className="text-sm text-slate-400 max-w-sm mb-6">
                            Share your music with listeners around the world
                        </p>
                        <button
                            onClick={() => {
                                if (!hasAvatar) {
                                    toast.info("Please add a profile photo before uploading.");
                                    return;
                                }
                                navigate("/studio/upload");
                            }}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${hasAvatar
                                ? "bg-primary text-background-dark hover:shadow-[0_0_15px_rgba(244,195,47,0.4)]"
                                : "bg-slate-700 text-slate-400 cursor-not-allowed"
                                }`}
                        >
                            Upload Song
                        </button>
                    </div>
                )}
            </section>

            {/* Edit modal */}
            {editingSong && (
                <EditSongModal
                    song={editingSong}
                    onClose={() => setEditingSong(null)}
                    onSaved={(updated) => {
                        setSongs((prev) => prev.map((s) => s._id === (updated._id || updated.id) ? { ...s, ...updated } : s));
                        setEditingSong(null);
                    }}
                />
            )}

            {/* Delete confirmation */}
            {deletingSong && (
                <ConfirmModal
                    title="Delete Song"
                    message={`Are you sure you want to delete "${deletingSong.title}"? This cannot be undone.`}
                    confirmLabel="Delete"
                    danger
                    onConfirm={async () => {
                        try {
                            await fetch(`/api/music/${deletingSong._id}`, {
                                method: 'DELETE', credentials: 'include',
                            });
                        } catch { /* ignore */ }
                        setSongs((prev) => prev.filter((s) => s._id !== deletingSong._id));
                        setDeletingSong(null);
                        toast.success('Song deleted');
                    }}
                    onCancel={() => setDeletingSong(null)}
                />
            )}
        </div>
    );
}
