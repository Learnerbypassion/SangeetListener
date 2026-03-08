import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { listMusic } from "../api/music";
import { normalizeSong } from "../utils/normalizeSong";

export default function ArtistAnalytics() {
    const { user } = useAuth();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("30d");
    const [totalDuration, setTotalDuration] = useState(0);

    useEffect(() => {
        listMusic()
            .then((res) => {
                const all = res.data.musics || [];
                const mySongs = all.filter(
                    (s) => s.artist?._id === user?.id || s.artist?.username === user?.username
                );
                setSongs(mySongs);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

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

    const totalPlays = songs.reduce((acc, s) => acc + (s.playsCount || 0), 0);
    const totalLikes = songs.reduce((acc, s) => acc + (s.likesCount || 0), 0);

    const PERIODS = [
        { value: "7d", label: "7 days" },
        { value: "30d", label: "30 days" },
        { value: "90d", label: "90 days" },
        { value: "all", label: "All time" },
    ];

    return (
        <div className="p-6 lg:p-10 pb-32 page-enter">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics</h1>
                    <p className="text-slate-400 text-sm mt-1">Track your music's performance</p>
                </div>
                <div className="flex gap-2">
                    {PERIODS.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all ${period === p.value
                                ? "bg-primary text-background-dark"
                                : "border border-border-dark text-slate-400 hover:text-white hover:border-slate-500"
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-surface-dark animate-pulse" />)}
                </div>
            ) : (
                <>
                    {/* Stat cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        {[
                            { label: "Total Playtime", value: totalDuration ? formatTotalDuration(totalDuration) : "0 min", icon: "schedule", color: "text-primary" },
                            { label: "Total Likes", value: totalLikes, icon: "favorite", color: "text-red-400" },
                            { label: "Followers", value: user?.followers?.length || 0, icon: "group", color: "text-blue-400" },
                            { label: "Uploads", value: songs.length, icon: "cloud_upload", color: "text-green-400" },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-surface-dark border border-border-dark rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`material-symbols-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
                                </div>
                                <p className="text-3xl font-bold text-white mb-1">
                                    {stat.value}
                                </p>
                                <p className="text-slate-400 text-sm">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Top performing songs */}
                    <section className="mb-10">
                        <h2 className="text-lg font-bold text-white mb-4">Top Songs</h2>
                        <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
                            {songs.length === 0 ? (
                                <div className="flex flex-col items-center py-12 gap-3 text-slate-500">
                                    <span className="material-symbols-outlined text-5xl">music_off</span>
                                    <p>No songs uploaded yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border-dark">
                                    {/* Table header */}
                                    <div className="grid grid-cols-12 px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                        <span className="col-span-1 text-center">#</span>
                                        <span className="col-span-5">Title</span>
                                        <span className="col-span-2 text-center">Plays</span>
                                        <span className="col-span-2 text-center">Likes</span>
                                        <span className="col-span-2 text-center">Status</span>
                                    </div>
                                    {[...songs]
                                        .sort((a, b) => (b.playsCount || 0) - (a.playsCount || 0))
                                        .map((song, idx) => {
                                            const s = normalizeSong(song);
                                            const maxPlays = songs[0]?.playsCount || 1;
                                            const barWidth = maxPlays > 0 ? ((s.playsCount || 0) / maxPlays) * 100 : 0;
                                            return (
                                                <div key={s._id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-border-dark/30 transition-colors">
                                                    <span className="col-span-1 text-slate-500 text-sm text-center">{idx + 1}</span>
                                                    <div className="col-span-5 flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-border-dark overflow-hidden flex-shrink-0">
                                                            {s.coverUrl ? (
                                                                <img src={s.coverUrl} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <span className="material-symbols-outlined text-primary/40 text-lg">music_note</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-white text-sm font-medium truncate">{s.title}</p>
                                                            <div className="w-full h-1 bg-border-dark rounded-full mt-1">
                                                                <div className="h-full bg-primary/50 rounded-full" style={{ width: `${barWidth}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2 text-center">
                                                        <span className="text-white text-sm font-semibold">{(s.playsCount || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="col-span-2 text-center">
                                                        <span className="text-red-400 text-sm font-semibold">{(s.likesCount || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="col-span-2 flex justify-center">
                                                        <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${s.visibility === "public"
                                                            ? "bg-green-900/60 text-green-400 border border-green-800"
                                                            : s.visibility === "draft"
                                                                ? "bg-yellow-900/60 text-yellow-400 border border-yellow-800"
                                                                : "bg-slate-800 text-slate-400 border border-slate-700"
                                                            }`}>
                                                            {s.visibility || "public"}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Growth tips */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-4">Growth Tips</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: "photo_camera", title: "Add Cover Art", body: "Songs with cover art get 3x more clicks.", done: songs.some((s) => normalizeSong(s).coverUrl) },
                                { icon: "description", title: "Add Descriptions", body: "Help listeners discover your music via search.", done: songs.some((s) => s.description) },
                                { icon: "label", title: "Tag Your Genres", body: "Genre tags put your music in the right explore feeds.", done: songs.some((s) => s.genre) },
                            ].map((tip) => (
                                <div key={tip.title} className={`flex items-start gap-4 p-5 rounded-2xl border ${tip.done ? "border-green-800/50 bg-green-900/10" : "border-border-dark bg-surface-dark"}`}>
                                    <div className={`p-2 rounded-xl ${tip.done ? "bg-green-900/40 text-green-400" : "bg-primary/10 text-primary"}`}>
                                        <span className="material-symbols-outlined text-xl">{tip.done ? "check_circle" : tip.icon}</span>
                                    </div>
                                    <div>
                                        <p className={`text-sm font-semibold mb-1 ${tip.done ? "text-green-400 line-through" : "text-white"}`}>{tip.title}</p>
                                        <p className="text-slate-400 text-xs leading-relaxed">{tip.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
