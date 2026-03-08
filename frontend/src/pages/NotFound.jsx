import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center page-enter">
            <div className="w-24 h-24 rounded-full bg-surface-dark flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary/40 text-5xl">music_off</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-3">404</h1>
            <p className="text-lg text-slate-300 mb-2">Page not found</p>
            <p className="text-sm text-slate-500 mb-8 max-w-sm">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/"
                className="px-6 py-2.5 rounded-full bg-primary text-background-dark font-semibold text-sm hover:shadow-[0_0_15px_rgba(244,195,47,0.4)] transition-all"
            >
                Go Home
            </Link>
        </div>
    );
}
