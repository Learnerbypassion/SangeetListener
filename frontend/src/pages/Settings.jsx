import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../api/axiosInstance";
import Toggle from "../components/common/Toggle";

export default function Settings() {
    const { user, logout, profile, updateProfile } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef(null);

    // Combine previous profile and settings state
    const [form, setForm] = useState({
        displayName: profile.displayName || user?.username || "",
        bio: profile.bio || "",
        region: profile.region || "Mumbai",
        streamingQuality: profile.streamingQuality || "high",
        autoplay: profile.autoplay !== false,
        emailNotifications: profile.emailNotifications !== false,
        privateSession: profile.privateSession || false,
        showNowPlaying: profile.showNowPlaying !== false,
        publicProfile: profile.publicProfile !== false,
    });

    const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl || null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggle = (key) =>
        setForm((p) => ({ ...p, [key]: !p[key] }));

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("bio", form.bio);
            formData.append("username", form.displayName);

            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const res = await api.put("/api/user/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            await updateProfile({
                bio: res.data.user.bio,
                avatarUrl: res.data.user.avatarUrl
            });

            toast.success("Settings saved successfully!");
        } catch (err) {
            toast.error("Failed to save settings");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : "U";

    return (
        <div className="p-6 lg:p-10 pb-32 max-w-3xl page-enter">
            <h1 className="text-2xl font-bold text-white mb-8">Settings & Profile</h1>

            {/* Profile Editing Section */}
            <SettingsSection title="Public Profile">
                <div className="p-6 flex flex-col md:flex-row gap-8 items-start">
                    {/* Avatar */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 p-[3px]">
                                <div className="w-full h-full rounded-full bg-surface-dark overflow-hidden flex items-center justify-center">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-primary">{initials}</span>
                                    )}
                                </div>
                            </div>
                            {/* Edit overlay */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
                                <span className="text-[10px] text-white font-medium mt-1 uppercase">Edit</span>
                            </button>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                        {!avatarPreview && user?.role === "Artist" && (
                            <p className="text-[10px] text-amber-500 mt-2 max-w-[100px] text-center">
                                Photo required for artists
                            </p>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="flex-1 space-y-4 w-full">
                        <div>
                            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Display Name</label>
                            <input
                                type="text"
                                value={form.displayName}
                                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-charcoal border border-border-dark text-white focus:outline-none focus:border-primary/50 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Region</label>
                            <select
                                value={form.region}
                                onChange={(e) => setForm({ ...form, region: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-charcoal border border-border-dark text-white focus:outline-none focus:border-primary/50 text-sm appearance-none"
                            >
                                <option value="Mumbai">Mumbai</option>
                                <option value="Delhi">Delhi</option>
                                <option value="Bangalore">Bangalore</option>
                                <option value="Kolkata">Kolkata</option>
                                <option value="Chennai">Chennai</option>
                                <option value="International">International</option>
                            </select>
                        </div>
                        {user?.role === "Artist" && (
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 flex justify-between">
                                    Artist Bio
                                    <span className="text-slate-500">{form.bio.length}/500</span>
                                </label>
                                <textarea
                                    value={form.bio}
                                    onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 500) })}
                                    maxLength={500}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl bg-charcoal border border-border-dark text-white focus:outline-none focus:border-primary/50 text-sm resize-none"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </SettingsSection>

            {/* Playback */}
            <SettingsSection title="Playback">
                <SettingsRow label="Autoplay" sub="When your audio ends, we'll play something similar">
                    <Toggle checked={form.autoplay} onChange={() => toggle("autoplay")} />
                </SettingsRow>
                <SettingsRow label="Audio Quality" sub="Streaming quality">
                    <select
                        value={form.streamingQuality}
                        onChange={(e) => setForm((p) => ({ ...p, streamingQuality: e.target.value }))}
                        className="bg-surface-dark border border-border-dark text-white text-sm rounded-lg p-2.5 cursor-pointer focus:ring-2 focus:ring-primary outline-none"
                    >
                        <option value="auto">Automatic</option>
                        <option value="high">High (320kbps)</option>
                        <option value="lossless">Lossless</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low (saves data)</option>
                    </select>
                </SettingsRow>
            </SettingsSection>

            {/* Privacy & Account */}
            <SettingsSection title="Privacy & Security">
                <SettingsRow label="Public Profile" sub="Let others see your profile and public playlists">
                    <Toggle checked={form.publicProfile} onChange={() => toggle("publicProfile")} />
                </SettingsRow>
                <SettingsRow label="Private Session" sub="Hide your listening activity temporarily">
                    <Toggle checked={form.privateSession} onChange={() => toggle("privateSession")} />
                </SettingsRow>
                <SettingsRow label="Email Notifications" sub="Receive updates about new releases">
                    <Toggle checked={form.emailNotifications} onChange={() => toggle("emailNotifications")} />
                </SettingsRow>
                <SettingsRow label="Email Address" sub={user?.email || "Not set"}>
                    <span className="text-slate-500 text-sm">Primary</span>
                </SettingsRow>
            </SettingsSection>

            {/* Save button */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="mt-6 bg-primary text-background-dark font-bold px-8 py-3 rounded-full hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(244,195,47,0.35)] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
                {saving ? "Saving..." : "Save Changes"}
            </button>

            {/* Danger zone */}
            <div className="mt-12 pt-8 border-t border-border-dark">
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4">Danger Zone</h3>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border-dark text-slate-300 hover:text-white hover:bg-surface-dark transition-colors cursor-pointer text-sm w-fit"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Sign out of Sangeet
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 transition-colors cursor-pointer text-sm w-fit">
                        <span className="material-symbols-outlined text-lg">delete_forever</span>
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}

function SettingsSection({ title, children }) {
    return (
        <div className="mb-8">
            <h2 className="text-base font-bold text-white mb-1">{title}</h2>
            <div className="bg-surface-dark rounded-2xl border border-border-dark divide-y divide-border-dark overflow-hidden">
                {children}
            </div>
        </div>
    );
}

function SettingsRow({ label, sub, children }) {
    return (
        <div className="flex items-center justify-between px-5 py-4">
            <div>
                <p className="text-white text-sm font-medium">{label}</p>
                {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
            </div>
            <div className="ml-6 flex-shrink-0">{children}</div>
        </div>
    );
}
