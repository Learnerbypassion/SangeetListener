import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { verifyOtp } from "../api/auth";
import { useToast } from "../context/ToastContext";

export default function OtpVerification() {
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const email = location.state?.email || "";
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await verifyOtp({ email, otp });
            toast.success("Email verified! You can now sign in.");
            navigate("/login");
        } catch (err) {
            const msg = err.response?.data?.message || "Verification failed. Please try again.";
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
                <div className="flex items-center justify-center gap-2 mb-8">
                    <span className="material-symbols-outlined text-primary text-4xl">graphic_eq</span>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Sangeet <span className="text-2xl text-slate-300">Listener</span>
                    </h1>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-primary text-3xl">mark_email_read</span>
                    </div>
                    <h2 className="text-xl font-semibold text-white text-center">Verify your email</h2>
                    <p className="text-sm text-slate-400 text-center mt-1">
                        We sent a 4-digit code to{" "}
                        <span className="text-primary font-medium">{email || "your email"}</span>
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 bg-amber-900/30 border border-amber-700/50 text-amber-200 rounded-lg p-3 mb-4 text-sm">
                        <span className="material-symbols-outlined text-[18px]">warning</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 block">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            placeholder="Enter 4-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            required
                            maxLength={4}
                            className="w-full px-4 py-3 rounded-xl bg-charcoal border border-border-dark text-white text-center text-2xl tracking-[0.5em] placeholder-slate-500 placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.length !== 4}
                        className="w-full py-3 rounded-full bg-primary text-background-dark font-semibold text-sm hover:shadow-[0_0_15px_rgba(244,195,47,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Verifying..." : "Verify Email"}
                    </button>
                </form>

                <p className="text-sm text-slate-400 text-center mt-6">
                    <Link to="/login" className="text-primary hover:underline font-medium">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
