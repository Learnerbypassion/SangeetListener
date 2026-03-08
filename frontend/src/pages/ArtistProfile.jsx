import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import { listMusic } from "../api/music";
import api from "../api/axiosInstance";
import SongCard from "../components/common/SongCard";
import { normalizeSong } from "../utils/normalizeSong";
import ScrollRow from "../components/common/ScrollRow";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

export default function ArtistProfile() {
    const { id: artistName } = useParams();
    const navigate = useNavigate();
    const { playSong } = usePlayer();
    const { user, isAuthenticated } = useAuth(); // ADDED useAuth

    const [loading, setLoading] = useState(true);
    const [songs, setSongs] = useState([]);
    const [publicPlaylists, setPublicPlaylists] = useState([]);

    // NEW ARTIST STATE
    const [artistData, setArtistData] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);

    useEffect(() => {
        const fetchArtistData = async () => {
            try {
                // 1. Fetch all songs and filter by this artist's username
                const res = await listMusic();
                const allSongs = res.data.musics || res.data.songs || res.data || [];
                const artistSongs = allSongs.filter(
                    (s) => (s.artist?.username || s.artistName) === artistName
                );
                setSongs(artistSongs);

                // Fetch public playlists
                try {
                    const plRes = await api.get(`/api/playlists/artist/${artistName}`);
                    setPublicPlaylists(plRes.data.playlists || []);
                } catch {
                    setPublicPlaylists([]);
                }

                // Fetch true artist document
                try {
                    const profileRes = await api.get(`/api/user/artist/${artistName}`);
                    const { artist } = profileRes.data;
                    setArtistData(artist);
                    setFollowersCount(artist.followers?.length || 0);
                    if (user?.id && artist.followers?.includes(user.id)) {
                        setIsFollowing(true);
                    }
                } catch (err) {
                    console.error("Failed to fetch artist metadata", err);
                }

            } catch (err) {
                console.error("Failed to fetch artist profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchArtistData();
    }, [artistName, user?.id]);

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

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    const handleFollowToggle = async () => {
        if (!isAuthenticated) return navigate("/login");
        if (!artistData?._id) return;

        try {
            const res = await api.post(`/api/user/follow/${artistData._id}`);
            setIsFollowing(res.data.isFollowing);
            setFollowersCount(res.data.followersCount);
        } catch (error) {
            console.error("Failed to toggle follow", error);
        }
    };

    const totalLikes = songs.reduce((sum, s) => sum + (s.likesCount || 0), 0);
    const coverSong = songs.find((s) => s.coverUrl) || songs[0];

    return (
        <div className="pb-32 page-enter">
            {/* Artist Header */}
            <div className="relative h-[30vh] sm:h-[40vh] md:h-[45vh] lg:h-[50vh] min-h-[300px] w-full p-6 md:p-10 flex flex-col justify-end overflow-hidden group">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={coverSong?.coverUrl || "/tanpuraBG.jpg"}
                        alt={artistName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col md:flex-row items-end gap-6 md:gap-8 max-w-7xl mx-auto w-full">
                    {/* Avatar */}
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-background-dark bg-surface-dark shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex-shrink-0 flex items-center justify-center">
                        {artistData?.avatarUrl ? (
                            <img src={artistData.avatarUrl} className="w-full h-full object-cover" alt="" />
                        ) : coverSong?.coverUrl ? (
                            <img src={coverSong.coverUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <span className="material-symbols-outlined text-primary/40 text-6xl">person</span>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            <span className="text-white font-medium text-sm tracking-widest uppercase">Verified Artist</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-4 drop-shadow-md truncate">
                            {artistName}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-300 text-sm md:text-base font-medium">
                            <p>{followersCount.toLocaleString()} {followersCount === 1 ? 'Follower' : 'Followers'}</p>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 hidden sm:block" />
                            <p>{songs.length} Tracks</p>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 hidden sm:block" />
                            <p>{totalLikes.toLocaleString()} Total Likes</p>
                            {totalDuration > 0 && (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 hidden sm:block" />
                                    <p>{formatTotalDuration(totalDuration)} Total Playtime</p>
                                </>
                            )}
                            {publicPlaylists.length > 0 && (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 hidden sm:block" />
                                    <p>{publicPlaylists.length} Public Playlists</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 md:px-10 py-6 max-w-7xl mx-auto flex items-center gap-4">
                <button
                    onClick={() => songs.length > 0 && playSong(songs[0])}
                    className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-background-dark hover:scale-105 active:scale-95 transition-all shadow-[0_4px_15px_rgba(244,195,47,0.3)] cursor-pointer"
                >
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                </button>
                {artistName !== user?.username && (
                    <button
                        onClick={handleFollowToggle}
                        className={`px-6 py-2 rounded-full border transition-all text-sm tracking-wide cursor-pointer uppercase font-semibold
                            ${isFollowing
                                ? "border-primary text-primary hover:border-red-500 hover:text-red-500"
                                : "border-border-dark text-white hover:border-slate-400 hover:scale-105"
                            }
                        `}
                    >
                        {isFollowing ? "Following" : "Follow"}
                    </button>
                )}
            </div>

            <div className="px-6 md:px-10 max-w-7xl mx-auto space-y-12">
                {/* Popular Tracks */}
                {songs.length > 0 ? (
                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Popular Tracks</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {songs.map((song) => (
                                <SongCard key={song._id} song={song} songList={songs} />
                            ))}
                        </div>
                    </section>
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 rounded-full bg-surface-dark mx-auto flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-slate-600 text-4xl">music_off</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No tracks yet</h3>
                        <p className="text-slate-400">Check back later for new releases from {artistName}.</p>
                    </div>
                )}

                {/* Public Playlists */}
                {publicPlaylists.length > 0 && (
                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Artist Playlists</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {publicPlaylists.map((p) => {
                                const fallbackCover = p.songs?.[0]?.coverUrl;
                                return (
                                    <div
                                        key={p._id}
                                        className="w-[140px] md:w-[160px] flex-shrink-0 group cursor-pointer"
                                        onClick={() => navigate(`/playlist/${p._id}`)}
                                    >
                                        <div className="aspect-square bg-border-dark rounded-2xl mb-3 overflow-hidden shadow-lg border border-border-dark relative">
                                            {p.coverUrl || fallbackCover ? (
                                                <img src={p.coverUrl || fallbackCover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.name} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-dark to-charcoal group-hover:scale-105 transition-transform duration-500">
                                                    <span className="material-symbols-outlined text-4xl text-white/30">public</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">{p.name}</h3>
                                            <p className="text-xs text-slate-400 truncate">{p.songs?.length || 0} songs</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
