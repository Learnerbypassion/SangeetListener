import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import SongCard from "../components/common/SongCard";

export default function CategoryPage() {
    const { category } = useParams();
    const [searchParams] = useSearchParams();
    const filterType = searchParams.get("type") || "genre";
    const navigate = useNavigate();
    const { playSong } = usePlayer();
    const [songs, setSongs] = useState([]);
    const [allSongs, setAllSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    const decodedCategory = decodeURIComponent(category);

    useEffect(() => {
        setLoading(true);
        // Fetch all songs, then filter client-side (backend doesn't have category filtering)
        fetch(`/api/music/list-musics`, { credentials: "include" })
            .then((r) => r.json())
            .then((data) => {
                const all = data.musics || data.songs || data || [];
                setAllSongs(all);
                const q = decodedCategory.toLowerCase();
                const filtered = all.filter((s) => {
                    if (filterType === "genre") return s.genre?.toLowerCase() === q;
                    if (filterType === "mood") return s.mood?.toLowerCase().includes(q);
                    return s.title?.toLowerCase().includes(q);
                });
                setSongs(filtered);
            })
            .catch(() => setSongs([]))
            .finally(() => setLoading(false));
    }, [category, filterType]);

    return (
        <div className="p-6 lg:p-10 pb-32 page-enter">
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 cursor-pointer transition-colors"
            >
                <span className="material-symbols-outlined">arrow_back</span>
                Back to Explore
            </button>

            {/* Hero header */}
            <div className="flex items-end gap-6 mb-10 p-8 rounded-2xl bg-gradient-to-br from-primary/20 to-surface-dark border border-border-dark">
                <div>
                    <p className="text-primary text-xs uppercase tracking-widest font-bold mb-2">{filterType}</p>
                    <h1 className="text-4xl font-bold text-white mb-1">{decodedCategory}</h1>
                    <p className="text-slate-400 text-sm">
                        {loading ? "Loading..." : `${songs.length} song${songs.length !== 1 ? "s" : ""}`}
                    </p>
                </div>
                {songs.length > 0 && (
                    <button
                        onClick={() => playSong(songs[0], songs)}
                        className="flex items-center gap-2 bg-primary text-background-dark font-bold px-6 py-3 rounded-full hover:bg-primary/90 active:scale-95 transition-all cursor-pointer ml-auto"
                    >
                        <span className="material-symbols-outlined">play_arrow</span>
                        Play All
                    </button>
                )}
            </div>

            {/* Songs grid */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="aspect-square rounded-xl bg-surface-dark animate-pulse" />
                    ))}
                </div>
            ) : songs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
                    <span className="material-symbols-outlined text-6xl">music_off</span>
                    <p className="text-lg">No songs in {decodedCategory} yet</p>
                    <p className="text-sm">Be the first to upload one!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 [&>*]:w-auto">
                    {songs.map((song) => <SongCard key={song._id} song={song} songList={songs} />)}
                </div>
            )}
        </div>
    );
}
