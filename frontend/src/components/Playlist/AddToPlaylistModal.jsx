import { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import api from "../../api/axiosInstance";

export function AddToPlaylistModal({ song, onClose }) {
    const toast = useToast();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingTo, setAddingTo] = useState(null);

    useEffect(() => {
        api.get(`/api/playlists`)
            .then((res) => setPlaylists(res.data.playlists || []))
            .catch((e) => {
                console.error(e);
                setPlaylists([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const addToPlaylist = async (playlist) => {
        setAddingTo(playlist._id);
        try {
            const playlistId = playlist._id;
            const res = await api.post(`/api/playlists/${playlistId}/songs/${song._id}`);
            if (res.data) {
                toast.success("Added to playlist");
                onClose();
            }
        } catch (e) {
            toast.error("Failed to add song");
            console.error(e);
        } finally {
            setAddingTo(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-surface-dark border border-border-dark rounded-2xl w-80 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold">Add to Playlist</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <p className="text-slate-400 text-xs mb-4 truncate">"{song?.title}"</p>

                {loading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl bg-border-dark animate-pulse" />)}
                    </div>
                ) : playlists.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">No playlists yet. Create one in My Library.</p>
                ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                        {playlists.map((pl) => (
                            <button
                                key={pl._id || pl.id}
                                onClick={() => addToPlaylist(pl)}
                                disabled={addingTo === (pl._id || pl.id)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-border-dark transition-colors cursor-pointer text-left"
                            >
                                <div className="w-10 h-10 rounded-lg bg-border-dark flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary text-lg">queue_music</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{pl.name}</p>
                                    <p className="text-slate-500 text-xs">{pl.song_count || pl.songs?.length || 0} songs</p>
                                </div>
                                {addingTo === (pl._id || pl.id) && (
                                    <span className="material-symbols-outlined text-primary text-lg animate-spin">refresh</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
