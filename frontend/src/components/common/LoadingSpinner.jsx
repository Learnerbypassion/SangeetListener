export function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-12">
            <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-2 border-border-dark" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
            </div>
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div className="flex flex-col gap-3">
            <div className="aspect-square rounded-xl animate-shimmer" />
            <div className="h-4 w-3/4 rounded animate-shimmer" />
            <div className="h-3 w-1/2 rounded animate-shimmer" />
        </div>
    );
}

export function SkeletonGrid({ count = 8 }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

export function PageLoading() {
    return (
        <div className="flex items-center justify-center h-[50vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-border-dark" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                </div>
                <p className="text-sm text-slate-400">Loading...</p>
            </div>
        </div>
    );
}
