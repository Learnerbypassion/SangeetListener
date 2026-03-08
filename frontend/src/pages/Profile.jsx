import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Toggle from "../components/common/Toggle";

export default function Profile() {
    const { user, profile, updateProfile } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        displayName: profile.displayName || user?.username || "",
        bio: profile.bio || "",
        region: profile.region || "Mumbai",
        emailNotifications: profile.emailNotifications !== false,
        publicProfile: profile.publicProfile !== false,
    });
    const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl || null);
    const [saving, setSaving] = useState(false);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            updateProfile({
                ...form,
                avatarUrl: avatarPreview,
            });
            toast.success("Profile updated successfully!");
        } catch (err) {
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : "U";

    return (
        <div className="px-6 md:px-10 py-8 max-w-3xl mx-auto page-enter">
            {/* Golden top bar */}
            <div className="h-1.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-t-2xl" />

            <div className="bg-surface-dark border border-border-dark border-t-0 rounded-b-2xl p-6 md:p-10">
                <h1 className="text-2xl font-bold text-white mb-8">Edit Profile</h1>

                {/* Avatar section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary/50 p-[3px]">
                            <div className="w-full h-full rounded-full bg-surface-dark overflow-hidden flex items-center justify-center">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-primary">{initials}</span>
                                )}
                            </div>
                        </div>
                        {/* Camera overlay */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                        </button>
                        {/* Edit button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg"
                        >
                            <span className="material-symbols-outlined text-background-dark text-[16px]">edit</span>
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
                        <div className="flex items-center gap-2 mt-3 bg-amber-900/20 border border-amber-700/30 rounded-lg px-3 py-2 text-xs text-amber-200">
                            <span className="material-symbols-outlined text-[16px]">warning</span>
                            Add a profile photo to upload songs
                        </div>
                    )}
                </div>

                {/* Form fields */}
                <div className="space-y-5">
                    <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
                            Display Name
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">
                                badge
                            </span>
                            <input
                                type="text"
                                value={form.displayName}
                                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal border border-border-dark text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
                            Region
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">
                                public
                            </span>
                            <select
                                value={form.region}
                                onChange={(e) => setForm({ ...form, region: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal border border-border-dark text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm appearance-none"
                            >
                                <option value="Mumbai">Mumbai</option>
                                <option value="Delhi">Delhi</option>
                                <option value="Bangalore">Bangalore</option>
                                <option value="Kolkata">Kolkata</option>
                                <option value="Chennai">Chennai</option>
                                <option value="International">International</option>
                            </select>
                        </div>
                    </div>

                    {user?.role === "Artist" && (
                        <div>
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                Artist Bio
                                <span className="text-slate-500 normal-case">{form.bio.length}/500</span>
                            </label>
                            <textarea
                                value={form.bio}
                                onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 500) })}
                                maxLength={500}
                                rows={4}
                                placeholder="Tell your audience about yourself..."
                                className="w-full px-4 py-3 rounded-xl bg-charcoal border border-border-dark text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm resize-none"
                            />
                        </div>
                    )}

                    {/* Preferences toggles */}
                    <div className="space-y-4 pt-4 border-t border-border-dark">
                        <h3 className="text-sm font-semibold text-white">Preferences</h3>
                        <Toggle
                            label="Email Notifications"
                            checked={form.emailNotifications}
                            onChange={(v) => setForm({ ...form, emailNotifications: v })}
                        />
                        <Toggle
                            label="Public Profile"
                            checked={form.publicProfile}
                            onChange={(v) => setForm({ ...form, publicProfile: v })}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border-dark">
                    <button className="px-6 py-2.5 rounded-full text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-2.5 rounded-full bg-primary text-background-dark font-semibold text-sm hover:shadow-[0_0_15px_rgba(244,195,47,0.4)] transition-all duration-300 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
