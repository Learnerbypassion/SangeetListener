import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listMusic } from "../api/music";
import SongCard from "../components/common/SongCard";
import ScrollRow from "../components/common/ScrollRow";
import { SkeletonGrid } from "../components/common/LoadingSpinner";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const MOODS = [
    { name: "Devotional", color: "from-amber-900 to-amber-700", icon: "🙏" },
    { name: "Melancholic", color: "from-rose-900 to-rose-700", icon: "💔" },
    { name: "Peaceful", color: "from-indigo-900 to-purple-700", icon: "🌙" },
    { name: "Joyful", color: "from-orange-800 to-yellow-600", icon: "🎉" },
    { name: "Energetic", color: "from-red-900 to-orange-600", icon: "⚡" },
    { name: "Romantic", color: "from-pink-900 to-rose-600", icon: "💕" },
    { name: "Nostalgic", color: "from-teal-900 to-teal-600", icon: "✨" },
    { name: "Focus", color: "from-blue-900 to-blue-600", icon: "🎯" },
];

const GENRES = [
    { name: "Pop", icon: "music_note" },
    { name: "Rock", icon: "electric_bolt" },
    { name: "Hip-Hop", icon: "headphones" },
    { name: "R&B", icon: "graphic_eq" },
    { name: "Electronic", icon: "equalizer" },
    { name: "Classical", icon: "piano" },
    { name: "Jazz", icon: "nightlife" },
    { name: "Indie", icon: "favorite" },
    { name: "Folk", icon: "forest" },
    { name: "Bollywood", icon: "movie" },
    { name: "Acoustic", icon: "music_cast" },
    { name: "Metal", icon: "whatshot" },
    { name: "Lo-Fi", icon: "headset" },
    { name: "Other", icon: "more_horiz" },
];

const REGIONS = [
    { name: "North America", sub: "Jazz, Blues & Country" },
    { name: "Latin America", sub: "Salsa, Samba & Reggaeton" },
    { name: "Europe", sub: "Classical, Celtic & EDM" },
    { name: "Africa", sub: "Afrobeat, Highlife & Mbalax" },
    { name: "Asia", sub: "Bollywood, K-Pop & Traditional" },
    { name: "Middle East", sub: "Sufi, Arabic Pop & Folk" },
];

export default function Explore() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [allSongs, setAllSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [popularPlaylists, setPopularPlaylists] = useState([]);
    const [popularArtists, setPopularArtists] = useState([]);

    useEffect(() => {
        Promise.all([
            listMusic(),
            api.get("/api/playlists/public/popular"),
            api.get("/api/user/artists/popular")
        ])
            .then(([resMusics, resPlaylists, resArtists]) => {
                setAllSongs(resMusics.data.musics || []);
                setPopularPlaylists(resPlaylists.data.playlists || []);
                setPopularArtists(resArtists.data.artists || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-6 lg:p-10 pb-32 space-y-12 page-enter">
            <div>
                <h1 className="text-3xl font-bold text-white">Discover More</h1>
                <p className="text-slate-400 mt-1">
                    Explore new sounds, moods, and musical traditions.
                </p>
            </div>

            {/* Browse by Mood */}
            <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>😊</span> Browse by Mood
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {MOODS.map((mood) => (
                        <button
                            key={mood.name}
                            onClick={() => navigate(`/explore/${encodeURIComponent(mood.name)}?type=mood`)}
                            className={`relative h-32 rounded-2xl bg-gradient-to-br ${mood.color} overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group`}
                        >
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                            <span className="absolute top-4 right-4 text-2xl opacity-60">{mood.icon}</span>
                            <span className="absolute bottom-4 left-4 text-white font-bold text-lg">
                                {mood.name}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Genre Chips */}
            <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">trending_up</span>
                    Trending Categories
                </h2>
                <div className="flex flex-wrap gap-3">
                    {GENRES.map((g) => (
                        <button
                            key={g.name}
                            onClick={() => navigate(`/explore/${encodeURIComponent(g.name)}?type=genre`)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border-dark text-sm font-medium transition-all cursor-pointer hover:scale-105 active:scale-95 text-slate-300 hover:border-primary hover:text-primary bg-surface-dark"
                        >
                            <span className="material-symbols-outlined text-base">{g.icon}</span>
                            {g.name}
                        </button>
                    ))}
                </div>
            </section>

            {/* Popular Playlists */}
            {popularPlaylists.length > 0 && (
                <section>
                    <div className="flex items-end justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">queue_music</span>
                            Popular Playlists
                        </h2>
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
                    <div className="flex items-end justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">person</span>
                            Popular Artists
                        </h2>
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



        </div>
    );
}
