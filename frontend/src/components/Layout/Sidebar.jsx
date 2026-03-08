import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";

// ─── NAV LINKS — shown to ALL users ──────────────────────────────────
const listenerLinks = [
    { to: "/", icon: "home", label: "Home" },
    { to: "/explore", icon: "explore", label: "Explore" },
    { to: "/library", icon: "library_music", label: "My Library" },
];

// ─── ARTIST STUDIO — only shown when role === 'Artist' ───────────────
const artistStudioLinks = [
    { to: "/studio", icon: "dashboard", label: "Artist Dashboard" },
    { to: "/studio/upload", icon: "cloud_upload", label: "Upload Song" },
    { to: "/studio/analytics", icon: "analytics", label: "Analytics" },
];

function SidebarLink({ to, icon, label, badge, onClick }) {
    return (
        <NavLink
            to={to}
            end={to === "/"}
            onClick={onClick}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium cursor-pointer ${isActive
                    ? "bg-primary/20 text-primary"
                    : "text-slate-400 hover:bg-surface-dark hover:text-white"
                }`
            }
        >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            <span>{label}</span>
            {badge && (
                <span className="ml-auto text-[10px] font-bold uppercase bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
        </NavLink>
    );
}

export default function Sidebar({ isOpen, onClose }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isArtist = user?.role === "Artist";

    const [playlists, setPlaylists] = useState([]);

    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!user) {
                setPlaylists([]);
                return;
            }
            try {
                const res = await api.get("/api/playlists");
                setPlaylists(res.data.playlists || []);
            } catch (err) {
                console.error(err);
                setPlaylists([]);
            }
        };

        fetchPlaylists();
        window.addEventListener("playlistUpdate", fetchPlaylists);
        return () => window.removeEventListener("playlistUpdate", fetchPlaylists);
    }, [user]);

    const closeMobile = () => {
        if (onClose) onClose();
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden cursor-pointer"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-charcoal border-r border-border-dark z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto flex flex-col pb-24 overflow-y-auto hide-scrollbar custom-scrollbar
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Logo */}
                <div
                    className="flex items-center gap-2 px-6 py-5 border-b border-border-dark cursor-pointer"
                    onClick={() => { navigate("/"); closeMobile(); }}
                >
                    <span className="material-symbols-outlined text-primary text-3xl">graphic_eq</span>
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        Sangeet <span className="text-base text-slate-300">Listener</span>
                    </h1>
                </div>

                {/* Listener nav — everyone sees this */}
                <nav className="flex flex-col gap-1 px-3 py-4">
                    <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider px-4 mb-2">
                        Menu
                    </p>
                    {listenerLinks.map((link) => (
                        <SidebarLink key={link.to} {...link} onClick={closeMobile} />
                    ))}
                </nav>

                {/* Your Playlists — from localStorage */}
                <div className="px-3 mt-2">
                    <div className="flex items-center justify-between px-4 mb-2">
                        <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                            Your Playlists
                        </p>
                    </div>
                    {playlists.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-slate-500 italic">
                            No playlists yet
                        </div>
                    ) : (
                        <nav className="flex flex-col gap-0.5 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                            {playlists.map((pl) => (
                                <NavLink
                                    key={pl._id}
                                    to={`/playlist/${pl._id}`}
                                    onClick={closeMobile}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all cursor-pointer ${isActive
                                            ? "bg-primary/15 text-primary"
                                            : "text-slate-400 hover:bg-surface-dark hover:text-white"
                                        }`
                                    }
                                >
                                    {pl.coverUrl ? (
                                        <img src={pl.coverUrl} alt={pl.name} className="w-5 h-5 rounded-sm object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-[18px]">
                                            {pl.isPublic ? "public" : "queue_music"}
                                        </span>
                                    )}
                                    <span className="truncate">{pl.name}</span>
                                    <span className="ml-auto text-[10px] text-slate-600">
                                        {pl.songs?.length || 0}
                                    </span>
                                </NavLink>
                            ))}
                        </nav>
                    )}
                </div>

                {/* Artist Studio — artists ONLY */}
                {isArtist && (
                    <div className="px-3 mt-4 border-t border-border-dark pt-4">
                        <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider px-4 mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[14px]">mic</span>
                            Artist Studio
                        </p>
                        <nav className="flex flex-col gap-1">
                            {artistStudioLinks.map((link) => (
                                <SidebarLink key={link.to} {...link} onClick={closeMobile} />
                            ))}
                        </nav>
                    </div>
                )}
            </aside>
        </>
    );
}
