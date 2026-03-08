import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import { useToast } from "../context/ToastContext";
import { normalizeSong } from "../utils/normalizeSong";
import { listMusic } from "../api/music";
import api from "../api/axiosInstance";

/* ── Add Songs Modal ─────────────────────────────────────────────── */
function AddSongsModal({ playlistId, existingSongIds, onClose, onAdded }) {
    const toast = useToast();
    const [tab, setTab] = useState("search"); // "search" | "suggestions"
    const [query, setQuery] = useState("");
    const [allSongs, setAllSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(null);

    useEffect(() => {
        listMusic()
            .then((res) => setAllSongs(res.data.musics || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    // Filter out songs already in playlist
    const available = useMemo(
        () => allSongs.filter((s) => !existingSongIds.has(s._id)),
        [allSongs, existingSongIds]
    );

    // Search results
    const searchResults = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return available.filter(
            (s) =>
                s.title?.toLowerCase().includes(q) ||
                s.artist?.username?.toLowerCase().includes(q)
        ).slice(0, 15);
    }, [available, query]);

    // Random suggestions
    const suggestions = useMemo(() => {
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 8);
    }, [available]);

    const addSong = async (song) => {
        setAdding(song._id);
        try {
            const res = await api.post(`/api/playlists/${playlistId}/songs/${song._id}`);
            if (res.data) {
                toast.success(`Added "${song.title}"`);
                onAdded(song);
            }
        } catch (e) {
            toast.error("Failed to add song");
            console.error(e);
        } finally {
            setAdding(null);
        }
    };

    const displayList = tab === "search" ? searchResults : suggestions;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-surface-dark border border-border-dark rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold text-lg">Add Songs</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-charcoal rounded-lg p-1 mb-4">
                    <button
                        onClick={() => setTab("search")}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${tab === "search" ? "bg-primary/20 text-primary" : "text-slate-400 hover:text-white"}`}
                    >
                        <span className="material-symbols-outlined text-sm mr-1 align-middle">search</span>
                        Search
                    </button>
                    <button
                        onClick={() => setTab("suggestions")}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${tab === "suggestions" ? "bg-primary/20 text-primary" : "text-slate-400 hover:text-white"}`}
                    >
                        <span className="material-symbols-outlined text-sm mr-1 align-middle">auto_awesome</span>
                        Suggestions
                    </button>
                </div>

                {/* Search input */}
                {tab === "search" && (
                    <div className="relative mb-4">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by title or artist..."
                            className="w-full bg-charcoal border border-border-dark rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                            autoFocus
                        />
                    </div>
                )}

                {/* Song list */}
                <div className="flex-1 overflow-y-auto space-y-1">
                    {loading ? (
                        <div className="space-y-2 py-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-14 bg-border-dark rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : tab === "search" && !query.trim() ? (
                        <p className="text-slate-500 text-sm text-center py-8">Type to search for songs</p>
                    ) : displayList.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-8">
                            {tab === "search" ? "No songs found" : "No suggestions available"}
                        </p>
                    ) : (
                        displayList.map((song) => {
                            const s = normalizeSong(song);
                            const isAdding = adding === song._id;
                            return (
                                <div
                                    key={s._id}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-charcoal transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-border-dark overflow-hidden flex-shrink-0">
                                        {s.coverUrl ? (
                                            <img src={s.coverUrl} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary/40 text-lg">music_note</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">{s.title}</p>
                                        <p className="text-slate-400 text-xs truncate">{s.artistName}</p>
                                    </div>
                                    <button
                                        onClick={() => addSong(song)}
                                        disabled={isAdding}
                                        className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        {isAdding ? (
                                            <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        )}
                                        Add
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ── Playlist Detail Page ────────────────────────────────────────── */
import EditPlaylistModal from "../components/Playlist/EditPlaylistModal";

import { useAuth } from "../context/AuthContext";

export default function PlaylistDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { playSong, addToQueue, toggleShuffle, shuffle } = usePlayer();
    const toast = useToast();
    const [playlist, setPlaylist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [totalDuration, setTotalDuration] = useState(0);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.get(`/api/playlists/${id}`)
            .then((res) => {
                setPlaylist(res.data.playlist);
                setSongs(res.data.playlist.songs || []);
            })
            .catch((err) => {
                console.error("Failed to load playlist", err);
                toast.error("Failed to load playlist");
            })
            .finally(() => setLoading(false));

        if (isAuthenticated) {
            api.get("/api/user/library").then(res => {
                const saved = res.data.playlists || [];
                setIsSaved(saved.some(p => p._id === id));
            }).catch(console.error);
        }
    }, [id, isAuthenticated]);

    useEffect(() => {
        if (!songs.length) {
            setTotalDuration(0);
            return;
        }

        const getDuration = (url) => {
            return new Promise((resolve) => {
                const audio = new Audio(url);
                audio.addEventListener("loadedmetadata", () => resolve(audio.duration || 0));
                audio.addEventListener("error", () => resolve(0));
            });
        };

        const calculateTotal = async () => {
            const promises = songs.map((s) => {
                const normalized = normalizeSong(s);
                return getDuration(normalized.musicUrl || normalized.uri);
            });
            const durations = await Promise.all(promises);
            const totalSeconds = durations.reduce((acc, curr) => acc + curr, 0);
            setTotalDuration(totalSeconds);
        };

        calculateTotal();
    }, [songs]);

    const formatTotalDuration = (seconds) => {
        if (!seconds) return "";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h} hr ${m} min`;
        return `${m} min`;
    };

    const removeSong = async (songId) => {
        try {
            await api.delete(`/api/playlists/${id}/songs/${songId}`);
            setSongs((prev) => prev.filter((s) => (s._id || s.id) !== songId));
            toast.success("Removed from playlist");
        } catch (err) {
            console.error(err);
            toast.error("Failed to remove song");
        }
    };

    const handleDeletePlaylist = async () => {
        try {
            await api.delete(`/api/playlists/${id}`);
            window.dispatchEvent(new Event("playlistUpdate"));
            toast.success("Playlist deleted");
            navigate("/library");
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete playlist");
        }
    };

    const toggleSavePlaylist = async () => {
        try {
            const res = await api.post(`/api/user/library/playlists/${id}`);
            setIsSaved(res.data.saved);
            toast.success(res.data.message);
        } catch (e) {
            console.error(e);
            toast.error("Failed to save playlist");
        }
    };

    const existingSongIds = useMemo(() => new Set(songs.map((s) => s._id || s.id)), [songs]);

    if (loading) {
        return (
            <div className="p-6 lg:p-10 pb-32">
                <div className="animate-pulse space-y-4">
                    <div className="h-40 bg-surface-dark rounded-2xl" />
                    <div className="h-8 bg-surface-dark rounded w-1/3" />
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-surface-dark rounded-xl" />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 pb-32 page-enter">
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 cursor-pointer transition-colors"
            >
                <span className="material-symbols-outlined">arrow_back</span>
                Back
            </button>

            {/* Header */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-10">
                <div className="w-40 h-40 md:w-56 md:h-56 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/30 to-surface-dark flex items-center justify-center flex-shrink-0 border border-border-dark shadow-lg">
                    {playlist?.coverUrl ? (
                        <img src={playlist.coverUrl} className="w-full h-full object-cover shadow-[0_4px_20px_rgba(0,0,0,0.5)]" alt="Playlist Cover" />
                    ) : (
                        <span className="material-symbols-outlined text-6xl text-primary/50">queue_music</span>
                    )}
                </div>
                <div className="flex-1 flex flex-col justify-end w-full">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Playlist</p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 tracking-tight drop-shadow-md">{playlist?.name || "Playlist"}</h1>

                    {playlist?.description && (
                        <p className="text-slate-400 text-sm mb-2 max-w-2xl">{playlist.description}</p>
                    )}

                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-4">
                        {playlist?.author && (
                            <>
                                <span>{playlist.author.username}</span>
                                <span className="w-1 h-1 bg-slate-500 rounded-full" />
                            </>
                        )}
                        <span>{songs.length} track{songs.length !== 1 && "s"}</span>
                        {playlist?.genre && (
                            <>
                                <span className="w-1 h-1 bg-slate-500 rounded-full" />
                                <span>{playlist.genre}</span>
                            </>
                        )}
                        {totalDuration > 0 && (
                            <>
                                <span className="w-1 h-1 bg-slate-500 rounded-full" />
                                <span>{formatTotalDuration(totalDuration)}</span>
                            </>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {songs.length > 0 && (
                            <>
                                <button
                                    onClick={() => {
                                        if (shuffle) toggleShuffle();
                                        playSong(songs[0], songs);
                                    }}
                                    className="flex items-center gap-2 bg-primary text-background-dark font-bold px-6 py-2.5 rounded-full hover:scale-105 hover:bg-primary/90 active:scale-95 transition-all cursor-pointer shadow-[0_4px_15px_rgba(244,195,47,0.3)]"
                                >
                                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                    Play
                                </button>
                                <button
                                    onClick={() => {
                                        toggleShuffle();
                                    }}
                                    className={`flex items-center gap-2 border px-5 py-2.5 rounded-full transition-all cursor-pointer text-sm font-medium ${shuffle
                                        ? "border-primary text-primary bg-primary/10 shadow-[0_0_10px_rgba(244,195,47,0.2)]"
                                        : "border-border-dark text-white hover:bg-surface-dark hover:border-slate-500"
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-lg">shuffle</span>
                                    Shuffle
                                </button>
                            </>
                        )}
                        {isAuthenticated && user?.id === playlist?.author?._id && (
                            <>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="flex items-center gap-2 border border-border-dark text-white hover:bg-surface-dark px-5 py-2.5 rounded-full transition-all cursor-pointer text-sm font-medium hover:border-slate-500"
                                >
                                    <span className="material-symbols-outlined text-lg">add</span>
                                    Add Songs
                                </button>
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="flex items-center gap-2 border border-border-dark text-white hover:bg-surface-dark px-5 py-2.5 rounded-full transition-all cursor-pointer text-sm font-medium hover:border-slate-500"
                                >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                    Edit
                                </button>
                            </>
                        )}
                        {isAuthenticated && user?.id !== playlist?.author?._id && (
                            <button
                                onClick={toggleSavePlaylist}
                                className={`flex items-center gap-2 border px-5 py-2.5 rounded-full transition-all cursor-pointer text-sm font-medium ${isSaved
                                    ? "border-primary text-primary"
                                    : "border-border-dark text-white hover:bg-surface-dark hover:border-slate-500"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>
                                    {isSaved ? "playlist_add_check" : "playlist_add"}
                                </span>
                                {isSaved ? "Saved" : "Save to Library"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Song list */}
            {songs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-4 text-slate-500">
                    <span className="material-symbols-outlined text-5xl">library_music</span>
                    <div className="text-center">
                        <p className="mb-1">No songs in this playlist yet.</p>
                        {isAuthenticated && user?.id === playlist?.author?._id && (
                            <p className="text-sm">Click "Add Songs" above to get started.</p>
                        )}
                    </div>
                    {isAuthenticated && user?.id === playlist?.author?._id && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2.5 rounded-full transition-colors cursor-pointer text-sm font-bold"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Add Songs
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    {songs.map((song, idx) => {
                        const s = normalizeSong(song);
                        return (
                            <div
                                key={s._id || idx}
                                className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-dark transition-colors cursor-pointer"
                                onClick={() => playSong(song, songs)}
                            >
                                <span className="text-slate-500 text-sm w-6 text-right group-hover:hidden">{idx + 1}</span>
                                <span className="material-symbols-outlined text-white hidden group-hover:block text-xl w-6 text-center">play_arrow</span>
                                <div className="w-10 h-10 rounded-lg bg-border-dark overflow-hidden flex-shrink-0">
                                    {s.coverUrl ? (
                                        <img src={s.coverUrl} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary/40 text-lg">music_note</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{s.title}</p>
                                    <p className="text-slate-400 text-xs truncate">{s.artistName}</p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToQueue(song);
                                            toast.success(`Added "${s.title}" to queue`);
                                        }}
                                        className="text-slate-400 hover:text-white transition-all cursor-pointer p-2"
                                        title="Add to queue"
                                    >
                                        <span className="material-symbols-outlined text-lg">queue_music</span>
                                    </button>
                                    {isAuthenticated && user?.id === playlist?.author?._id && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeSong(s._id); }}
                                            className="text-slate-400 hover:text-red-400 transition-all cursor-pointer p-2"
                                            title="Remove"
                                        >
                                            <span className="material-symbols-outlined text-lg">remove_circle_outline</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add songs modal */}
            {showAddModal && (
                <AddSongsModal
                    playlistId={id}
                    existingSongIds={existingSongIds}
                    onClose={() => setShowAddModal(false)}
                    onAdded={(song) => setSongs((prev) => [...prev, song])}
                />
            )}
            {/* Edit Modal */}
            {showEditModal && playlist && (
                <EditPlaylistModal
                    playlist={playlist}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={(updatedData) => {
                        setPlaylist((prev) => ({ ...prev, ...updatedData }));
                        // Fetch fresh playlist to get all nested populated data
                        api.get(`/api/playlists/${id}`).then(res => setPlaylist(res.data.playlist)).catch(console.error);
                    }}
                    onDelete={handleDeletePlaylist}
                />
            )}
        </div>
    );
}
