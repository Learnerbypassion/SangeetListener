import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState({});
    const navigate = useNavigate();

    // Run ONCE on app mount — verify session cookie
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await api.get("/api/user/profile");
                if (!active) return;
                if (res.data?.user) {
                    const dbUser = res.data.user;
                    const data = {
                        id: dbUser._id,
                        role: dbUser.role,
                        username: dbUser.username || "User",
                        email: dbUser.email || "",
                        display_name: dbUser.username || "User",
                        followers: dbUser.followers || [],
                    };
                    setUser(data);
                    setProfile({
                        avatarUrl: dbUser.avatarUrl || "",
                        bio: dbUser.bio || "",
                        likedSongs: dbUser.likedSongs || []
                    });
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch {
                if (active) {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } finally {
                if (active) setIsLoading(false);
            }
        })();
        return () => { active = false; };
    }, []); // ← empty deps, never re-runs

    const login = useCallback(async ({ username, email, password }) => {
        const res = await api.post("/api/auth/login", { username, email, password });
        const data = {
            username: res.data.username,
            email: res.data.email,
            role: res.data.role,
            display_name: res.data.username,
        };
        setUser(data);
        setIsAuthenticated(true);
        return data;
    }, []);

    const register = useCallback(async ({ username, email, password, role }) => {
        const res = await api.post("/api/auth/register", { username, email, password, role });
        return res.data;
    }, []);

    const logout = useCallback(async () => {
        // 1. Clear state first
        setUser(null);
        setIsAuthenticated(false);

        // 2. Call server (fire-and-forget, don't await)
        fetch(`/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        }).catch(() => { });

        // 3. Navigate with replace
        navigate('/login', { replace: true });
    }, [navigate]);

    // Profile sync
    const updateProfile = useCallback(async (updates) => {
        try {
            let res;
            if (updates instanceof FormData) {
                res = await api.put("/api/user/profile", updates, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await api.put("/api/user/profile", updates);
            }
            if (res.data?.user) {
                const dbUser = res.data.user;
                setProfile(prev => ({
                    ...prev,
                    avatarUrl: dbUser.avatarUrl || prev.avatarUrl,
                    bio: dbUser.bio || prev.bio,
                    displayName: dbUser.username || prev.displayName
                }));
                setUser(prev => ({
                    ...prev,
                    username: dbUser.username || prev.username
                }));
            }
        } catch (e) {
            console.error("Failed to update profile", e);
            throw e;
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoading,
            profile,
            loading: isLoading, // backward compat
            login,
            register,
            logout,
            updateProfile,
            setUser,
            setIsAuthenticated,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
