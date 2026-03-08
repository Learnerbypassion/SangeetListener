import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import { useToast } from "../context/ToastContext";
import { listMusic } from "../api/music";
import api from "../api/axiosInstance";
import SongCard from "../components/common/SongCard";
import ScrollRow from "../components/common/ScrollRow";
import CreatePlaylistModal from "../components/Playlist/CreatePlaylistModal";

const TABS = ["Playlists", "Artists"];

export default function MyLibrary() {
    const navigate = useNavigate();
    const { queue, currentSong, likedIds, toggleLike } = usePlayer();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState("Playlists");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [allSongs, setAllSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load all songs to identify liked songs
    useEffect(() => {
        listMusic()
            .then((res) => setAllSongs(res.data.musics || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const { user } = useAuth(); // Import useAuth to get user info

    const [playlists, setPlaylists] = useState([]);
    const [savedPlaylists, setSavedPlaylists] = useState([]);
    const [followedArtists, setFollowedArtists] = useState([]);

    const fetchPlaylists = async () => {
        try {
            const [plRes, libRes] = await Promise.all([
                api.get("/api/playlists"),
                api.get("/api/user/library")
            ]);
            setPlaylists(plRes.data.playlists || []);
            setSavedPlaylists(libRes.data.playlists || []);
            setFollowedArtists(libRes.data.artists || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPlaylists();
        }
        window.addEventListener("playlistUpdate", fetchPlaylists);
        return () => window.removeEventListener("playlistUpdate", fetchPlaylists);
    }, [user]);

    const handleCreatePlaylist = async (newPlaylist, coverFile) => {
        setIsCreateModalOpen(false);
        try {
            const res = await api.post("/api/playlists", newPlaylist);
            const createdPlaylistId = res.data.playlist._id;

            if (coverFile) {
                const formData = new FormData();
                formData.append("cover", coverFile);
                await api.put(`/api/playlists/${createdPlaylistId}/cover`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }

            toast.success(`"${res.data.playlist.name}" created!`);
            fetchPlaylists(); // Immediately reload list with the new cover
            window.dispatchEvent(new Event("playlistUpdate"));
        } catch (e) {
            toast.error("Failed to create playlist");
            console.error(e);
        }
    };

    const likedSongs = allSongs.filter((s) => likedIds?.has(s._id));

    return (
        <div className="p-6 lg:p-10 pb-32 page-enter">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">My Library</h1>
            <p className="text-slate-400 text-sm mb-6">Your personal music collection</p>

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer
              ${activeTab === tab
                                ? "bg-white text-background-dark"
                                : "text-slate-400 hover:text-white border border-border-dark hover:border-slate-500"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>



            {/* Playlists tab */}
            {activeTab === "Playlists" && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {/* Create playlist card */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="aspect-square rounded-2xl bg-surface-dark border-2 border-dashed border-border-dark hover:border-primary flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-border-dark/30 transition-all group active:scale-95"
                    >
                        <span className="material-symbols-outlined text-5xl text-slate-500 group-hover:text-primary transition-colors">
                            add
                        </span>
                        <p className="text-sm font-semibold text-slate-400 group-hover:text-white transition-colors">
                            Create Playlist
                        </p>
                        <p className="text-xs text-slate-500">Build your collection</p>
                    </button>

                    {/* Create Playlist Modal */}
                    <CreatePlaylistModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        onCreate={handleCreatePlaylist}
                    />

                    {/* Existing playlists */}
                    {[...playlists, ...savedPlaylists].filter((v, i, a) => a.findIndex(t => t._id === v._id) === i).map((pl) => (
                        <div
                            key={pl._id}
                            onClick={() => navigate(`/playlist/${pl._id}`)}
                            className="aspect-square rounded-2xl bg-surface-dark border border-border-dark p-4 flex flex-col justify-between hover:bg-border-dark/50 transition-colors cursor-pointer group"
                        >
                            <div className="w-full flex-1 flex items-center justify-center overflow-hidden mb-3">
                                {pl.coverUrl ? (
                                    <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <span className="material-symbols-outlined text-5xl text-primary/30 group-hover:text-primary/50 transition-colors">
                                        queue_music
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white truncate">{pl.name}</p>
                                <p className="text-xs text-slate-500">{pl.songs?.length || 0} songs</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Artists tab */}
            {activeTab === "Artists" && (
                followedArtists.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 rounded-full bg-surface-dark flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-slate-600 text-4xl">person</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">No followed artists</h3>
                        <p className="text-sm text-slate-400 max-w-sm">Follow artists to see them here</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {followedArtists.map((artist) => (
                            <div
                                key={artist._id}
                                onClick={() => navigate(`/artist/${artist.username}`)}
                                className="flex flex-col items-center p-4 rounded-xl cursor-pointer group transition-all"
                            >
                                <div className="w-32 h-32 rounded-full overflow-hidden mb-3 border-2 border-transparent group-hover:border-primary transition-colors shadow-lg shadow-black/40 bg-surface-dark">
                                    {artist.avatarUrl ? (
                                        <img src={artist.avatarUrl} alt={artist.username} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-4xl text-slate-600">person</span>
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-white font-semibold text-sm group-hover:text-primary transition-colors">{artist.username}</h4>
                                <span className="text-xs font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full mt-1">Artist</span>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Liked Songs section — always visible below tabs */}
            {likedSongs.length > 0 && (
                <section className="mt-10 mb-10">
                    <ScrollRow title={`Liked Songs (${likedSongs.length})`}>
                        {likedSongs.map((song) => (
                            <SongCard key={song._id} song={song} songList={likedSongs} />
                        ))}
                    </ScrollRow>
                </section>
            )}

            {/* Recently Played queue */}
            {queue.length > 0 && (
                <section className="mt-10">
                    <h2 className="text-xl font-bold text-white mb-4">Current Queue</h2>
                    <div className="space-y-2">
                        {queue.map((song, i) => (
                            <div
                                key={song._id || i}
                                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors cursor-pointer ${currentSong?._id === song._id
                                    ? "bg-primary/10 border border-primary/20"
                                    : "hover:bg-surface-dark"
                                    }`}
                            >
                                <div className="w-12 h-12 rounded-lg bg-surface-dark overflow-hidden flex-shrink-0">
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary/40">music_note</span>
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-white truncate">{song.title}</p>
                                    <p className="text-xs text-slate-400 truncate">{song.artist?.username || "Unknown"}</p>
                                </div>
                                {currentSong?._id === song._id && (
                                    <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        graphic_eq
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
