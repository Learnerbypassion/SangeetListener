import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import { listMusic } from "../api/music";
import api from "../api/axiosInstance";
import SongCard from "../components/common/SongCard";
import ScrollRow from "../components/common/ScrollRow";
import { SkeletonGrid } from "../components/common/LoadingSpinner";
import { normalizeSong } from "../utils/normalizeSong";

const LABELS = [
    { range: [5, 12], label: "Morning Raga", icon: "wb_sunny" },
    { range: [12, 17], label: "Afternoon Melody", icon: "light_mode" },
    { range: [17, 21], label: "Evening Raga", icon: "routine" },
    { range: [21, 5], label: "Night Serenade", icon: "nightlight" },
];

const QUOTES = [
    "Let the notes unfold the story of your day.",
    "Where words end, music begins.",
    "Feel every note, embrace every silence.",
    "Music is the shorthand of emotion.",
    "Lose yourself in the rhythm of the moment.",
    "A melody a day keeps the chaos away.",
    "Let the raga paint your world in colour.",
    "The soul that hears music, feels the pulse of life.",
];

function getTimeLabel() {
    const h = new Date().getHours();
    for (const l of LABELS) {
        const [start, end] = l.range;
        if (start < end ? h >= start && h < end : h >= start || h < end) return l;
    }
    return LABELS[0];
}

export default function Home() {
    const { user } = useAuth();
    const { playSong, toggleLike, likedIds, recentlyPlayed } = usePlayer();
    const navigate = useNavigate();
    const [songs, setSongs] = useState([]);
    const [popularPlaylists, setPopularPlaylists] = useState([]);
    const [popularArtists, setPopularArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const isArtist = user?.role === "Artist";

    useEffect(() => {
        Promise.all([
            listMusic(),
            api.get("/api/playlists/public/popular"),
            api.get("/api/user/artists/popular")
        ])
            .then(([resMusics, resPlaylists, resArtists]) => {
                setSongs(resMusics.data.musics || []);
                setPopularPlaylists(resPlaylists.data.playlists || []);
                setPopularArtists(resArtists.data.artists || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good Morning";
        if (h < 17) return "Good Afternoon";
        return "Good Evening";
    };

    // Pick a random featured song per session
    const featuredSong = useMemo(() => {
        if (songs.length === 0) return null;
        return songs[Math.floor(Math.random() * songs.length)];
    }, [songs]);

    const timeLabel = getTimeLabel();
    const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);
    const featured = featuredSong ? normalizeSong(featuredSong) : null;

    // Create stable arrays for Popular and Top Artists from the loaded songs
    const popularSongs = useMemo(() => [...songs].reverse().slice(0, 10), [songs]);
    const topArtistSongs = useMemo(() => {
        const artistSet = new Set();
        const distinct = songs.filter(s => {
            const id = s.artist?._id || "unknown";
            if (artistSet.has(id)) return false;
            artistSet.add(id);
            return true;
        });
        return distinct.length > 2 ? distinct.slice(0, 10) : [...songs].sort(() => 0.5 - Math.random()).slice(0, 10);
    }, [songs]);

    return (
        <div className="p-6 lg:p-10 pb-32 space-y-10 page-enter">
            {/* Hero banner */}
            {featured && (
                <section
                    className="relative rounded-2xl overflow-hidden min-h-[280px] sm:h-72 flex items-end p-6 md:p-8"
                    style={{
                        backgroundImage: `url('${featured.coverUrl || "/tanpuraBG.jpg"}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/70 to-charcoal/20" />
                    <div className="relative z-10 w-full">
                        <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                            <span className="material-symbols-outlined text-sm">{timeLabel.icon}</span>
                            {timeLabel.label}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                            {featured.title}
                        </h1>
                        <p className="text-slate-300 text-sm max-w-lg mb-6 italic">
                            "{quote}"
                        </p>
                        <div className="flex flex-wrap items-center gap-3 w-full">
                            <button
                                onClick={() => playSong(featuredSong, songs)}
                                className="flex items-center gap-2 bg-primary text-background-dark font-bold px-6 py-3 rounded-full hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(244,195,47,0.4)] active:scale-95 transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                Play Now
                            </button>
                            <button
                                onClick={() => toggleLike(featuredSong._id)}
                                className={`flex items-center gap-2 border px-6 py-3 rounded-full active:scale-95 transition-all cursor-pointer ${likedIds?.has(featuredSong._id)
                                    ? "border-primary text-primary"
                                    : "border-white/30 text-white hover:bg-white/10"
                                    }`}
                            >
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: likedIds?.has(featuredSong._id) ? "'FILL' 1" : "'FILL' 0" }}>
                                    {likedIds?.has(featuredSong._id) ? "heart_minus" : "favorite_border"}
                                </span>
                                {likedIds?.has(featuredSong._id) ? "Remove from Library" : "Save to Library"}
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Greeting */}
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {greeting()}, {user?.display_name || user?.username} 🎵
                </h2>
                <p className="text-slate-400 text-sm">Here's what's playing on Sangeet today.</p>
            </div>

            {/* Featured Tracks */}
            {loading ? (
                <SkeletonGrid count={5} />
            ) : (
                <>
                    <ScrollRow title="Featured Tracks" seeAllHref="/explore">
                        {songs.map((song) => (
                            <SongCard key={song._id} song={song} songList={songs} />
                        ))}
                    </ScrollRow>

                    {recentlyPlayed.length > 0 && (
                        <ScrollRow title="Recently Played">
                            {recentlyPlayed.map((song) => (
                                <SongCard key={song._id || song.id} song={song} songList={recentlyPlayed} />
                            ))}
                        </ScrollRow>
                    )}

                    {/* Popular Songs */}
                    {popularSongs.length > 0 && (
                        <ScrollRow title="Popular Hits">
                            {popularSongs.map((song) => (
                                <SongCard key={song._id + "_pop"} song={song} songList={popularSongs} />
                            ))}
                        </ScrollRow>
                    )}

                    {/* Popular Playlists */}
                    {popularPlaylists.length > 0 && (
                        <section>
                            <div className="flex items-end justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Popular Playlists</h2>
                                    <p className="text-slate-400 text-sm">Top public picks you might love.</p>
                                </div>
                            </div>
                            <ScrollRow>
                                {popularPlaylists.map((p) => {
                                    const fallbackCover = p.songs?.[0]?.coverUrl;
                                    return (
                                        <div
                                            key={p._id}
                                            className="w-[160px] md:w-[200px] flex-shrink-0 group cursor-pointer"
                                            onClick={() => navigate(`/playlist/${p._id}`)}
                                        >
                                            <div className="aspect-square bg-border-dark rounded-xl mb-3 overflow-hidden shadow-lg border border-white/5 relative">
                                                {p.coverUrl || fallbackCover ? (
                                                    <img src={p.coverUrl || fallbackCover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.name} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-dark to-charcoal group-hover:scale-105 transition-transform duration-500">
                                                        <span className="material-symbols-outlined text-4xl text-white/30">queue_music</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center drop-shadow-lg">
                                                    <span className="material-symbols-outlined text-4xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">play_circle</span>
                                                </div>
                                            </div>
                                            <h3 className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">{p.name}</h3>
                                            <p className="text-xs text-slate-400 truncate">By {p.author?.username}</p>
                                        </div>
                                    );
                                })}
                            </ScrollRow>
                        </section>
                    )}

                    {/* Popular Artists */}
                    {popularArtists.length > 0 && (
                        <section>
                            <div className="flex items-end justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Popular Artists</h2>
                                    <p className="text-slate-400 text-sm">Chart-topping creators.</p>
                                </div>
                            </div>
                            <ScrollRow>
                                {popularArtists.filter(a => a.username !== user?.username).map((a) => (
                                    <div
                                        key={a._id}
                                        className="w-[140px] md:w-[160px] flex-shrink-0 group cursor-pointer text-center"
                                        onClick={() => navigate(`/artist/${encodeURIComponent(a.username)}`)}
                                    >
                                        <div className="aspect-square bg-border-dark rounded-full mx-auto mb-3 overflow-hidden shadow-lg border-2 border-transparent group-hover:border-primary transition-all duration-300 relative">
                                            {a.avatarUrl ? (
                                                <img src={a.avatarUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={a.username} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-dark to-charcoal group-hover:scale-105 transition-transform duration-500">
                                                    <span className="material-symbols-outlined text-4xl text-white/30">person</span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">{a.username}</h3>
                                        <p className="text-xs text-slate-400 truncate">Artist</p>
                                    </div>
                                ))}
                            </ScrollRow>
                        </section>
                    )}

                    {/* Top Artists Picks */}
                    {topArtistSongs.length > 0 && (
                        <ScrollRow title="Top Artists Releases">
                            {topArtistSongs.map((song) => (
                                <SongCard key={song._id + "_art"} song={song} songList={topArtistSongs} />
                            ))}
                        </ScrollRow>
                    )}
                </>
            )}

            {/* Artist FAB */}
            {isArtist && (
                <Link
                    to="/studio/upload"
                    className="fixed bottom-28 right-6 z-40 flex items-center gap-2 bg-primary text-background-dark font-bold pl-4 pr-5 py-3 rounded-full shadow-lg shadow-primary/25 hover:shadow-[0_0_25px_rgba(244,195,47,0.4)] active:scale-95 transition-all cursor-pointer"
                >
                    <span className="material-symbols-outlined">upload</span>
                    Upload Song
                </Link>
            )}
        </div>
    );
}
