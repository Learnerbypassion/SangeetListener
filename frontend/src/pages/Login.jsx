import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const toast = useToast();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await login({
                username: form.email,
                email: form.email,
                password: form.password,
            });
            toast.success(`Welcome back, ${data.username}!`);
            navigate("/");
        } catch (err) {
            const msg = err.response?.data?.message || "Login failed. Please try again.";
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
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Login card */}
            <div className="relative z-10 w-full max-w-md bg-surface-dark/95 backdrop-blur-xl border border-border-dark rounded-2xl p-8 animate-slide-up">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <span className="material-symbols-outlined text-primary text-4xl">graphic_eq</span>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Sangeet <span className="text-2xl text-slate-300">Listener</span>
                    </h1>
                </div>

                <h2 className="text-xl font-semibold text-white text-center mb-1">Welcome back</h2>
                <p className="text-sm text-slate-400 text-center mb-6">Sign in to continue listening</p>

                {/* Error message */}
                {error && (
                    <div className="flex items-center gap-2 bg-amber-900/30 border border-amber-700/50 text-amber-200 rounded-lg p-3 mb-4 text-sm">
                        <span className="material-symbols-outlined text-[18px]">warning</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 block">
                            Email or Username
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">
                                mail
                            </span>
                            <input
                                type="text"
                                placeholder="Enter your email or username"
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
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal border border-border-dark text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                            />
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
                                Signing in...
                            </span>
                        ) : (
                            "Sign in"
                        )}
                    </button>
                </form>

                <p className="text-sm text-slate-400 text-center mt-6">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-primary hover:underline font-medium">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}
