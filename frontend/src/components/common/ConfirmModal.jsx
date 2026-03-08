export function ConfirmModal({ title, message, confirmLabel = "Confirm", danger = false, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-surface-dark border border-border-dark rounded-2xl w-80 p-6 shadow-2xl">
                <h3 className="text-white font-bold text-base mb-2">{title}</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 border border-border-dark text-slate-300 py-2.5 rounded-full hover:bg-border-dark cursor-pointer text-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 font-bold py-2.5 rounded-full active:scale-95 cursor-pointer text-sm transition-all ${danger
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-primary text-background-dark hover:bg-primary/90"
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
