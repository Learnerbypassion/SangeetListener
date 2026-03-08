import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const toast = useToast();
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        role: "User",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await register(form);
            toast.success("Account created! Please verify your email.");
            // Redirect to OTP verification with email
            navigate("/verify-otp", { state: { email: form.email } });
        } catch (err) {
            const msg = err.response?.data?.message || "Registration failed. Please try again.";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 relative"
            style={{
                backgroundImage: "url('/tanpuraBG.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="absolute inset-0 bg-black/60" />

            <div className="relative z-10 w-full max-w-md bg-surface-dark/95 backdrop-blur-xl border border-border-dark rounded-2xl p-8 animate-slide-up">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <span className="material-symbols-outlined text-primary text-4xl">graphic_eq</span>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Sangeet <span className="text-2xl text-slate-300">Listener</span>
                    </h1>
                </div>

                <h2 className="text-xl font-semibold text-white text-center mb-1">Create your account</h2>
                <p className="text-sm text-slate-400 text-center mb-6">Join the music community</p>

                {error && (
                    <div className="flex items-center gap-2 bg-amber-900/30 border border-amber-700/50 text-amber-200 rounded-lg p-3 mb-4 text-sm">
                        <span className="material-symbols-outlined text-[18px]">warning</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 block">
                            Username
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">
                                person
                            </span>
                            <input
                                type="text"
                                placeholder="Choose a username"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal border border-border-dark text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 block">
                            Email
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">
                                mail
                            </span>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal border border-border-dark text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 block">
                            Password
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">
                                lock
                            </span>
                            <input
                                type="password"
                                placeholder="Create a password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                minLength={6}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal border border-border-dark text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* Role selector */}
                    <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                            I am a
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: "User", icon: "headphones", label: "Listener" },
                                { value: "Artist", icon: "piano", label: "Artist" },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setForm({ ...form, role: option.value })}
                                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${form.role === option.value
                                        ? "bg-primary/20 border-primary text-primary"
                                        : "bg-charcoal border-border-dark text-slate-400 hover:border-slate-500"
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{option.icon}</span>
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-full bg-primary text-background-dark font-semibold text-sm hover:shadow-[0_0_15px_rgba(244,195,47,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Creating account...
                            </span>
                        ) : (
                            "Create account"
                        )}
                    </button>
                </form>

                <p className="text-sm text-slate-400 text-center mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
