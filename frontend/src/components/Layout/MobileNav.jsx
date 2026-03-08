import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function MobileNav() {
    const { user } = useAuth();
    const isArtist = user?.role === "Artist";

    // Same listener links for everyone
    const baseLinks = [
        { to: "/", icon: "home", label: "Home" },
        { to: "/explore", icon: "explore", label: "Explore" },
        { to: "/library", icon: "library_music", label: "Library" },
    ];

    const links = isArtist
        ? [...baseLinks, { to: "/studio", icon: "dashboard", label: "Studio" }]
        : [...baseLinks, { to: "/settings", icon: "settings", label: "Settings" }];

    return (
        <nav className="fixed bottom-0 md:bottom-0 left-0 right-0 z-[100] bg-charcoal border-t border-border-dark lg:hidden pb-safe">
            <div className="flex items-center justify-around py-2">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === "/"}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg cursor-pointer active:scale-90 transition-all ${isActive ? "text-primary" : "text-slate-500 hover:text-slate-300"
                            }`
                        }
                    >
                        <span className="material-symbols-outlined text-[22px]">{link.icon}</span>
                        <span className="text-[10px] font-medium">{link.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
