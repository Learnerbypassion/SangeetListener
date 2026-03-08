import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { listMusic } from "../api/music";
import { usePlayer } from "../context/PlayerContext";
import SongCard from "../components/common/SongCard";
import ScrollRow from "../components/common/ScrollRow";
import api from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Search() {
    const [params] = useSearchParams();
    const query = params.get("q") || "";
    const [songs, setSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [artists, setArtists] = useState([]);
    const [popularPlaylists, setPopularPlaylists] = useState([]);
    const [popularArtists, setPopularArtists] = useState([]);
    const [loading, setLoading] = useState(false);
    const { playSong } = usePlayer();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Fetch popular categories unconditionally for the empty state
    useEffect(() => {
        Promise.all([
            api.get("/api/playlists/public/popular").catch(() => ({ data: { playlists: [] } })),
            api.get("/api/user/artists/popular").catch(() => ({ data: { artists: [] } }))
        ]).then(([resPlaylists, resArtists]) => {
            setPopularPlaylists(resPlaylists.data.playlists || []);
            setPopularArtists(resArtists.data.artists || []);
        });
    }, []);

    // Perform dynamic search
    useEffect(() => {
        if (!query) {
            setSongs([]);
            setPlaylists([]);
            setArtists([]);
            return;
        }
        setLoading(true);
        api.get(`/api/search?q=${encodeURIComponent(query)}`)
            .then((res) => {
                setSongs(res.data.songs || []);
                setPlaylists(res.data.playlists || []);
                setArtists(res.data.artists || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [query]);

    const hasResults = songs.length > 0 || playlists.length > 0 || artists.length > 0;

    return (
        <div className="p-6 lg:p-10 pb-32 page-enter">
            <h1 className="text-2xl font-bold text-white mb-2">
                {query ? (
                    <>Results for <span className="text-primary">"{query}"</span></>
                ) : (
                    "Search"
                )}
            </h1>

            {loading && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="aspect-square rounded-xl bg-surface-dark animate-shimmer" />
                    ))}
                </div>
            )}

            {!loading && query && !hasResults && (
                <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-500">
                    <span className="material-symbols-outlined text-6xl">search_off</span>
                    <p className="text-lg">No results found for "{query}"</p>
                    <p className="text-sm">Try different keywords or check your spelling</p>
                </div>
            )}

            {!loading && query && hasResults && (
                <div className="mt-8 space-y-10">
                    {/* Song Results */}
                    {songs.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-4">Songs</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 [&>*]:w-auto">
                                {songs.map((song) => (
                                    <SongCard key={song._id} song={song} songList={songs} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Playlist Results */}
                    {playlists.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-4">Playlists</h2>
                            <ScrollRow>
                                {playlists.map((p) => {
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

                    {/* Artist Results */}
                    {artists.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-4">Artists</h2>
                            <ScrollRow>
                                {artists.map((a) => (
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
            )}

            {!query && (
                <div className="mt-8 space-y-10">
                    {/* Search Hero placeholder */}
                    {popularPlaylists.length === 0 && popularArtists.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-48 gap-4 text-slate-500">
                            <span className="material-symbols-outlined text-6xl">search</span>
                            <p className="text-lg">Enter a search term to find music</p>
                        </div>
                    )}

                    {/* Popular Playlists */}
                    {popularPlaylists.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">Popular Playlists</h2>
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
                            <h2 className="text-xl font-bold text-white mb-4">Popular Artists</h2>
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
            )}
        </div>
    );
}
