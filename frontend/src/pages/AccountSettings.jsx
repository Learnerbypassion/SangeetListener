import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Toggle from "../components/common/Toggle";

export default function AccountSettings() {
    const { user, profile, updateProfile } = useAuth();
    const toast = useToast();
    const initials = user?.username?.slice(0, 2).toUpperCase() || "U";

    const [form, setForm] = useState({
        displayName: profile.displayName || user?.username || "",
        bio: profile.bio || "",
        audioQuality: profile.audioQuality || "high",
        emailNotifications: profile.emailNotifications !== false,
        privateSession: profile.privateSession || false,
    });

    const handleSave = async () => {
        try {
            await updateProfile({
                username: form.displayName,
                bio: form.bio,
            });
            toast.success("Settings saved!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save settings");
        }
    };

    return (
        <div className="px-6 md:px-10 py-8 max-w-6xl mx-auto page-enter">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">Account Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left column — Profile card + Connected accounts */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Profile card */}
                    <div className="bg-surface-dark rounded-2xl border border-border-dark p-8 text-center">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto mb-4 bg-gradient-to-br from-primary to-primary/50 p-[3px]">
                            <div className="w-full h-full rounded-full bg-surface-dark overflow-hidden flex items-center justify-center">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-primary">{initials}</span>
                                )}
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-1">{user?.username}</h2>

                        <div className="flex items-center justify-center gap-1 mb-2">
                            <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                verified
                            </span>
                            <span className="text-xs text-primary font-medium uppercase tracking-wider">
                                {user?.role === "Artist" ? "Artist" : "Member"}
                            </span>
                        </div>

                        <p className="text-sm text-slate-400 mb-6">{user?.email}</p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border-dark">
                            {[
                                { label: "Playlists", value: "0" },
                                { label: "Following", value: "0" },
                                { label: "Followers", value: "0" },
                            ].map((stat) => (
                                <div key={stat.label}>
                                    <p className="text-lg font-bold text-white">{stat.value}</p>
                                    <p className="text-xs text-slate-500">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Connected Accounts */}
                    <div className="bg-surface-dark rounded-2xl border border-border-dark p-6">
                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                            Connected Accounts
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-900/50 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-green-400 text-[16px]">music_note</span>
                                    </div>
                                    <span className="text-sm text-slate-300">Spotify</span>
                                </div>
                                <span className="text-xs text-green-400 font-medium">Connected</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-blue-400 text-[16px]">account_circle</span>
                                    </div>
                                    <span className="text-sm text-slate-300">Google</span>
                                </div>
                                <button className="text-xs text-primary hover:underline font-medium">Connect</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column — Settings */}
                <div className="lg:col-span-8 space-y-6">
                    {/* About You */}
                    <div className="bg-surface-dark rounded-2xl border border-border-dark p-6 md:p-8">
                        <h3 className="text-lg font-bold text-white mb-6">About You</h3>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={form.displayName}
                                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-charcoal border border-border-dark text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between">
                                    Bio
                                    <span className="text-slate-500 normal-case">{form.bio.length}/300</span>
                                </label>
                                <textarea
                                    value={form.bio}
                                    onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 300) })}
                                    maxLength={300}
                                    rows={3}
                                    placeholder="Tell us about yourself..."
                                    className="w-full px-4 py-3 rounded-xl bg-charcoal border border-border-dark text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm resize-none"
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                className="text-sm text-primary font-semibold hover:underline"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>

                    {/* Account Preferences */}
                    <div className="bg-surface-dark rounded-2xl border border-border-dark p-6 md:p-8">
                        <h3 className="text-lg font-bold text-white mb-6">Account Preferences</h3>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
                                    Audio Quality
                                </label>
                                <select
                                    value={form.audioQuality}
                                    onChange={(e) => setForm({ ...form, audioQuality: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-charcoal border border-border-dark text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm appearance-none"
                                >
                                    <option value="high">High Quality (320kbps)</option>
                                    <option value="lossless">Lossless</option>
                                    <option value="standard">Standard (128kbps)</option>
                                </select>
                            </div>

                            <Toggle
                                label="Email Notifications"
                                checked={form.emailNotifications}
                                onChange={(v) => {
                                    setForm({ ...form, emailNotifications: v });
                                    updateProfile({ emailNotifications: v });
                                }}
                            />

                            <Toggle
                                label="Private Session"
                                checked={form.privateSession}
                                onChange={(v) => {
                                    setForm({ ...form, privateSession: v });
                                    updateProfile({ privateSession: v });
                                }}
                            />

                            {/* Danger Zone */}
                            <div className="pt-6 mt-6 border-t border-border-dark">
                                <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3">Danger Zone</h4>
                                <button className="px-6 py-2.5 rounded-lg border border-red-700/50 text-red-400 text-sm font-medium hover:bg-red-900/20 transition-colors">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
