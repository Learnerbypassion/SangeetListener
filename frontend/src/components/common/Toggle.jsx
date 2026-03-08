export default function Toggle({ checked, onChange, label }) {
    return (
        <label className="flex items-center justify-between cursor-pointer">
            {label && <span className="text-sm text-slate-300">{label}</span>}
            <div className="relative">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <div className="w-11 h-6 bg-border-dark rounded-full peer peer-checked:bg-primary transition-colors duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </div>
        </label>
    );
}
