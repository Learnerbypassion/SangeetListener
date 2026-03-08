import { useRef, useState, useEffect } from "react";

export default function ScrollRow({ title, seeAllHref, children }) {
    const scrollRef = useRef(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(false);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanLeft(el.scrollLeft > 10);
        setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        el?.addEventListener("scroll", checkScroll);
        window.addEventListener("resize", checkScroll);
        return () => {
            el?.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, [children]);

    const scroll = (dir) => {
        scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
    };

    return (
        <section className="group/row relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-0">
                <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
                {seeAllHref && (
                    <a
                        href={seeAllHref}
                        className="text-primary text-sm font-semibold hover:underline cursor-pointer ml-1"
                    >
                        See All
                    </a>
                )}
            </div>

            {/* Scrollable content with floating arrows */}
            <div className="relative group/scroll">
                {/* Left Arrow Overlay */}
                <div
                    className={`absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background-dark via-background-dark/80 to-transparent z-10 flex items-center justify-start opacity-0 group-hover/scroll:opacity-100 transition-opacity pointer-events-none ${canLeft ? 'block' : 'hidden'}`}
                >
                    <button
                        onClick={() => scroll(-1)}
                        className="p-2 ml-2 rounded-full border border-border-dark bg-surface-dark text-white hover:border-primary hover:text-primary active:scale-90 transition-all cursor-pointer pointer-events-auto"
                        data-tooltip="Scroll left"
                    >
                        <span className="material-symbols-outlined text-lg">chevron_left</span>
                    </button>
                </div>

                {/* Right Arrow Overlay */}
                <div
                    className={`absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background-dark via-background-dark/80 to-transparent z-10 flex items-center justify-end opacity-0 group-hover/scroll:opacity-100 transition-opacity pointer-events-none ${canRight ? 'block' : 'hidden'}`}
                >
                    <button
                        onClick={() => scroll(1)}
                        className="p-2 mr-2 rounded-full border border-border-dark bg-surface-dark text-white hover:border-primary hover:text-primary active:scale-90 transition-all cursor-pointer pointer-events-auto"
                        data-tooltip="Scroll right"
                    >
                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                </div>

                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar scroll-smooth"
                >
                    {children}
                </div>
            </div>
        </section>
    );
}
