import { useToast } from "../../context/ToastContext";

const typeStyles = {
    success: "bg-green-900/90 border-green-700 text-green-200",
    error: "bg-red-900/90 border-red-700 text-red-200",
    info: "bg-surface-dark/90 border-border-dark text-slate-200",
};

const typeIcons = {
    success: "check_circle",
    error: "error",
    info: "info",
};

export default function Toast() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-28 right-4 z-[60] flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl backdrop-blur animate-fade-in ${typeStyles[toast.type] || typeStyles.info
                        }`}
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {typeIcons[toast.type] || typeIcons.info}
                    </span>
                    <p className="text-sm flex-1">{toast.message}</p>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            ))}
        </div>
    );
}
