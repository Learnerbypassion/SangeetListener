import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePlayer } from "../../context/PlayerContext";
import { useNotification } from "../../context/NotificationContext";
import { normalizeSong } from "../../utils/normalizeSong";

export default function Header({ onMenuToggle }) {
    const { user, logout } = useAuth();
    const { playSong } = usePlayer();
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const { notifications, clearNotifications } = useNotification();
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);
    const debounceRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        clearTimeout(debounceRef.current);
        if (!val.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/search?q=${encodeURIComponent(val)}`,
                    { credentials: 'include' }
                );
                const data = await res.json();

                const songs = (data.songs || []).slice(0, 3).map(s => ({ ...s, itemType: 'song' }));
                const artists = (data.artists || []).slice(0, 2).map(a => ({ ...a, itemType: 'artist' }));
                const playlists = (data.playlists || []).slice(0, 2).map(p => ({ ...p, itemType: 'playlist' }));

                const combined = [...artists, ...playlists, ...songs];
                setSuggestions(combined);
                setShowSuggestions(true);
            } catch { /* ignore */ }
        }, 300);
    };

    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : "U";

    return (
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 lg:px-6 py-3 bg-charcoal/90 backdrop-blur-md border-b border-border-dark h-16 gap-4">
            {/* LEFT — Hamburger on mobile */}
            <div className="flex items-center flex-shrink-0 lg:hidden">
                <button
                    onClick={onMenuToggle}
                    className="p-2 text-slate-400 hover:text-white active:scale-95 transition-all cursor-pointer"
                    aria-label="Toggle menu"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </div>

            {/* CENTER — Search bar */}
            <div className="flex-1 flex justify-center max-w-xl mx-auto">
                <div className="relative w-full">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl pointer-events-none">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Search for ragas, artists, or songs..."
                        value={query}
                        onChange={handleChange}
                        onKeyDown={(e) => { if (e.key === "Enter") { navigate(`/search?q=${encodeURIComponent(query)}`); setShowSuggestions(false); } }}
                        onFocus={() => query && suggestions.length > 0 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="w-full rounded-full bg-surface-dark border border-border-dark py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                    {/* Clear button */}
                    {query && (
                        <button
                            onClick={() => { setQuery(""); setSuggestions([]); setShowSuggestions(false); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                    )}

                    {/* Suggestions dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full mt-2 left-0 right-0 bg-surface-dark border border-border-dark rounded-2xl shadow-2xl z-50 overflow-hidden">
                            {suggestions.map((item) => {
                                if (item.itemType === 'song') {
                                    const s = normalizeSong(item);
                                    return (
                                        <button
                                            key={`song-${s._id}`}
                                            onMouseDown={() => { playSong(item); setQuery(s.title); setShowSuggestions(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-border-dark/50 transition-colors cursor-pointer text-left"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-border-dark overflow-hidden flex-shrink-0">
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
                                                <p className="text-slate-400 text-xs truncate">Song • {s.artistName}</p>
                                            </div>
                                            <span className="material-symbols-outlined text-slate-600 text-lg">north_west</span>
                                        </button>
                                    );
                                } else if (item.itemType === 'artist') {
                                    return (
                                        <button
                                            key={`artist-${item._id}`}
                                            onMouseDown={() => { navigate(`/artist/${encodeURIComponent(item.username)}`); setQuery(item.username); setShowSuggestions(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-border-dark/50 transition-colors cursor-pointer text-left"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-border-dark overflow-hidden flex-shrink-0">
                                                {item.avatarUrl ? (
                                                    <img src={item.avatarUrl} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-dark to-charcoal">
                                                        <span className="material-symbols-outlined text-primary/40 text-base">person</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-medium truncate">{item.username}</p>
                                                <p className="text-slate-400 text-xs truncate">Artist</p>
                                            </div>
                                            <span className="material-symbols-outlined text-slate-600 text-lg">north_west</span>
                                        </button>
                                    );
                                } else if (item.itemType === 'playlist') {
                                    const fallbackCover = item.songs?.[0]?.coverUrl;
                                    return (
                                        <button
                                            key={`playlist-${item._id}`}
                                            onMouseDown={() => { navigate(`/playlist/${item._id}`); setQuery(item.name); setShowSuggestions(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-border-dark/50 transition-colors cursor-pointer text-left"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-border-dark overflow-hidden flex-shrink-0">
                                                {item.coverUrl || fallbackCover ? (
                                                    <img src={item.coverUrl || fallbackCover} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-primary/40 text-lg">queue_music</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-medium truncate">{item.name}</p>
                                                <p className="text-slate-400 text-xs truncate">Playlist</p>
                                            </div>
                                            <span className="material-symbols-outlined text-slate-600 text-lg">north_west</span>
                                        </button>
                                    );
                                }
                            })}
                            <div className="px-4 py-2.5 border-t border-border-dark">
                                <button
                                    onMouseDown={() => { navigate(`/search?q=${encodeURIComponent(query)}`); setShowSuggestions(false); }}
                                    className="text-primary text-xs font-semibold hover:underline cursor-pointer"
                                >
                                    See all results for "{query}" →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT — Notifications + User */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {/* Notifications Dropdown */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setNotifOpen((o) => !o)}
                        className={`relative p-2 rounded-full transition-all cursor-pointer ${notifOpen ? "bg-surface-dark text-primary" : "text-slate-400 hover:text-primary hover:bg-surface-dark active:scale-90"}`}
                        data-tooltip="Notifications"
                    >
                        <span className="material-symbols-outlined text-2xl">notifications</span>
                        {notifications.length > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-charcoal" />
                        )}
                    </button>

                    {notifOpen && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-surface-dark border border-border-dark rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in flex flex-col max-h-[400px]">
                            <div className="px-4 py-3 border-b border-border-dark flex items-center justify-between">
                                <h3 className="text-white font-bold text-sm">Notifications</h3>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearNotifications}
                                        className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                            <div className="overflow-y-auto flex-1 p-2 space-y-1">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-sm text-slate-500 italic">
                                        No new notifications
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div key={n.id} className="flex gap-3 px-3 py-3 rounded-lg hover:bg-border-dark/50 transition-colors">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {n.type === "uploading" || n.status === "loading" ? (
                                                    <span className="material-symbols-outlined text-primary animate-spin">sync</span>
                                                ) : n.status === "error" || n.type === "error" ? (
                                                    <span className="material-symbols-outlined text-red-400">error</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-green-400">check_circle</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{n.title}</p>
                                                <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{n.message}</p>
                                                <p className="text-[10px] text-slate-500 mt-1">
                                                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                {n.progress !== undefined && (
                                                    <div className="w-full bg-surface-dark border border-border-dark rounded-full h-1.5 mt-2 overflow-hidden">
                                                        <div
                                                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                                            style={{ width: `${n.progress}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                    {/* Desktop: dropdown menu */}
                    <button
                        onClick={() => setDropdownOpen((o) => !o)}
                        className="hidden sm:flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-surface-dark hover:bg-border-dark border border-border-dark transition-colors cursor-pointer"
                    >
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-orange-500 flex items-center justify-center text-background-dark font-bold text-xs flex-shrink-0">
                                {initials}
                            </div>
                        )}
                        <span className="text-sm font-medium text-white max-w-[100px] truncate">
                            {user?.display_name || user?.username}
                        </span>
                        <span className="material-symbols-outlined text-slate-400 text-lg">expand_more</span>
                    </button>

                    {/* Dropdown — Settings + Sign Out only */}
                    {dropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-52 bg-surface-dark border border-border-dark rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in hidden sm:block">
                            <div className="px-4 py-3 border-b border-border-dark">
                                <p className="text-white font-semibold text-sm">{user?.display_name || user?.username}</p>
                                <p className="text-slate-400 text-xs truncate">{user?.email}</p>
                            </div>
                            <nav className="p-2">
                                <button
                                    onClick={() => { setDropdownOpen(false); navigate("/settings"); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-border-dark/50 transition-colors cursor-pointer text-sm text-left"
                                >
                                    <span className="material-symbols-outlined text-lg">settings</span>
                                    Settings
                                </button>
                            </nav>
                            <div className="p-2 border-t border-border-dark">
                                <button
                                    onClick={(e) => { e.stopPropagation(); logout(); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-sm"
                                >
                                    <span className="material-symbols-outlined text-lg">logout</span>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
