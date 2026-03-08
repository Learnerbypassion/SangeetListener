import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../../context/PlayerContext";
import { normalizeSong } from "../../utils/normalizeSong";
import { AddToPlaylistModal } from "../Playlist/AddToPlaylistModal";

function formatTime(s) {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function ImmersivePlayer({ onClose }) {
    const navigate = useNavigate();
    const {
        currentSong,
        isPlaying,
        progress,
        duration,
        togglePlay,
        skipNext,
        skipPrev,
        shuffle,
        repeat,
        toggleShuffle,
        toggleRepeat,
        seek,
        queue,
        likedIds,
        toggleLike,
        addToQueue,
    } = usePlayer();

    const [showPlaylistModal, setShowPlaylistModal] = useState(false);

    if (!currentSong) return null;

    const pct = duration > 0 ? (progress / duration) * 100 : 0;
    const isLiked = likedIds?.has(currentSong._id);
    const normalized = normalizeSong(currentSong);
    const artistName = normalized.artistName;

    return (
        <>
            <div className="fixed inset-0 z-[100] bg-background-dark flex">
                {/* Left — Main player */}
                <div className="flex-1 flex flex-col h-full overflow-y-auto">
                    {/* Header */}
                    <header className="flex items-center justify-between px-8 py-5 flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="text-white/60 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-2xl">keyboard_arrow_down</span>
                        </button>
                        <div className="flex flex-col items-center">
                            <span className="text-primary text-[10px] font-bold tracking-[0.2em] uppercase">
                                Now Playing
                            </span>
                            <span className="text-white/80 text-xs mt-0.5">
                                Sangeet <span className="text-[10px] text-white/60">Listener</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                className="text-white/60 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 cursor-pointer"
                                data-tooltip="Cast"
                            >
                                <span className="material-symbols-outlined text-xl">cast</span>
                            </button>
                            <button
                                className="text-white/60 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 cursor-pointer"
                                data-tooltip="More options"
                            >
                                <span className="material-symbols-outlined text-xl">more_horiz</span>
                            </button>
                        </div>
                    </header>

                    {/* Main content area */}
                    <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8 -mt-8">
                        {/* Cover art */}
                        <div className="w-full max-w-[360px] aspect-square mb-10">
                            {normalized.coverUrl ? (
                                <img
                                    src={normalized.coverUrl}
                                    alt={currentSong.title}
                                    className="w-full h-full object-cover rounded-xl shadow-2xl"
                                />
                            ) : (
                                <div className="w-full h-full rounded-xl shadow-2xl bg-surface-dark flex items-center justify-center">
                                    <span className="material-symbols-outlined text-8xl text-primary/30">music_note</span>
                                </div>
                            )}
                        </div>

                        {/* Title + Artist */}
                        <div className="text-center mb-8 w-full max-w-md">
                            <h1 className="text-white text-2xl md:text-3xl font-bold tracking-tight mb-2">
                                {currentSong.title}
                            </h1>
                            <p className="text-primary text-base md:text-lg font-serif italic">
                                {artistName}
                            </p>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full max-w-md flex flex-col gap-2 mb-8">
                            <div
                                className="relative w-full h-1 bg-border-dark rounded-full cursor-pointer group"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const pos = (e.clientX - rect.left) / rect.width;
                                    seek(pos * duration);
                                }}
                            >
                                <div
                                    className="h-full bg-primary rounded-full transition-[width]"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                                <span>{formatTime(progress)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Transport controls */}
                        <div className="flex items-center justify-center gap-10 mb-8">
                            <button
                                onClick={toggleShuffle}
                                className={`hover:scale-110 transition-all cursor-pointer ${shuffle ? "text-primary" : "text-white/50 hover:text-white"}`}
                                data-tooltip="Shuffle"
                            >
                                <span className="material-symbols-outlined text-2xl">shuffle</span>
                            </button>
                            <button
                                onClick={skipPrev}
                                className="text-white hover:text-primary hover:scale-110 transition-all cursor-pointer"
                                data-tooltip="Previous"
                            >
                                <span className="material-symbols-outlined text-3xl">skip_previous</span>
                            </button>
                            <button
                                onClick={togglePlay}
                                className="flex items-center justify-center w-16 h-16 bg-primary text-background-dark rounded-full shadow-[0_0_20px_rgba(244,195,47,0.25)] hover:shadow-[0_0_40px_rgba(244,195,47,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {isPlaying ? "pause" : "play_arrow"}
                                </span>
                            </button>
                            <button
                                onClick={skipNext}
                                className="text-white hover:text-primary hover:scale-110 transition-all cursor-pointer"
                                data-tooltip="Next"
                            >
                                <span className="material-symbols-outlined text-3xl">skip_next</span>
                            </button>
                            <button
                                onClick={toggleRepeat}
                                className={`hover:scale-110 transition-all cursor-pointer relative ${repeat !== "off" ? "text-primary" : "text-white/50 hover:text-white"}`}
                                data-tooltip="Repeat"
                            >
                                <span className="material-symbols-outlined text-2xl">
                                    {repeat === "one" ? "repeat_one" : "repeat"}
                                </span>
                                {repeat !== "off" && (
                                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                                )}
                            </button>
                        </div>

                        {/* Action buttons — like, share, add to playlist, add to queue */}
                        <div className="flex items-center gap-8">
                            <button
                                onClick={() => toggleLike?.(currentSong._id)}
                                className={`transition-all hover:scale-110 active:scale-90 cursor-pointer ${isLiked ? "text-primary" : "text-white/50 hover:text-white"}`}
                                data-tooltip={isLiked ? "Unlike" : "Like"}
                            >
                                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>
                                    {isLiked ? "favorite" : "favorite_border"}
                                </span>
                            </button>
                            <button
                                onClick={() => setShowPlaylistModal(true)}
                                className="text-white/50 hover:text-white transition-all hover:scale-110 cursor-pointer"
                                data-tooltip="Add to playlist"
                            >
                                <span className="material-symbols-outlined text-2xl">playlist_add</span>
                            </button>
                            {addToQueue && (
                                <button
                                    onClick={() => addToQueue(currentSong)}
                                    className="text-white/50 hover:text-white transition-all hover:scale-110 cursor-pointer"
                                    data-tooltip="Add to queue"
                                >
                                    <span className="material-symbols-outlined text-2xl">add_to_queue</span>
                                </button>
                            )}
                            <button className="text-white/50 hover:text-white transition-all hover:scale-110 cursor-pointer" data-tooltip="Share">
                                <span className="material-symbols-outlined text-2xl">share</span>
                            </button>
                        </div>

                        {/* Close chevron at bottom */}
                        <button
                            onClick={onClose}
                            className="mt-8 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-3xl">expand_more</span>
                        </button>
                    </div>
                </div>

                {/* Right sidebar — Queue + Recommendations + Artist */}
                <aside className="hidden lg:flex flex-col w-[340px] h-full border-l border-border-dark flex-shrink-0 overflow-y-auto bg-charcoal">
                    {/* Queue */}
                    <div className="p-5 flex-shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold text-sm">Coming Up Next</h3>
                            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 bg-surface-dark px-2 py-1 rounded">
                                Queue
                            </span>
                        </div>
                        <div className="space-y-1">
                            {queue.slice(0, 8).map((song, i) => {
                                const s = normalizeSong(song);
                                return (
                                    <div
                                        key={song._id || i}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${currentSong?._id === song._id
                                            ? "bg-primary/10 text-primary"
                                            : "text-slate-400 hover:bg-surface-dark hover:text-white"
                                            }`}
                                    >
                                        <span className="text-xs text-slate-600 w-4 text-right flex-shrink-0">{i + 1}</span>
                                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-surface-dark">
                                            {s.coverUrl ? (
                                                <img src={s.coverUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-primary/30 text-sm">music_note</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium text-sm">{s.title}</p>
                                            <p className="text-xs text-slate-500 truncate">{s.artistName}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {queue.length === 0 && (
                                <p className="text-slate-500 text-sm py-6 text-center">Queue is empty</p>
                            )}
                        </div>
                    </div>

                    {/* Recommendations placeholder */}
                    <div className="px-5 py-4 border-t border-border-dark flex-shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Recommendations</h3>
                            <span className="text-[10px] text-slate-500 hover:text-primary cursor-pointer transition-colors">View All</span>
                        </div>
                        <div className="space-y-3">
                            {queue.slice(1, 3).map((song, i) => {
                                const s = normalizeSong(song);
                                return (
                                    <div key={`rec-${i}`} className="flex items-center gap-3 cursor-pointer hover:bg-surface-dark rounded-lg px-2 py-1.5 transition-colors">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-dark">
                                            {s.coverUrl ? (
                                                <img src={s.coverUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-primary/30">music_note</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-white text-sm font-medium truncate">{s.title}</p>
                                            <p className="text-slate-500 text-xs truncate">{s.artistName}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Artist card */}
                    <div className="mt-auto p-5 border-t border-border-dark flex-shrink-0">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-surface-dark flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary/40">person</span>
                            </div>
                            <div>
                                <h4 className="text-white font-serif text-sm font-semibold">{artistName}</h4>
                                <p className="text-primary/70 text-xs">Artist</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                onClose();
                                navigate(`/artist/${encodeURIComponent(artistName)}`);
                            }}
                            className="w-full flex items-center justify-center gap-2 border border-border-dark text-white/70 hover:text-white hover:border-slate-500 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                            View Full Bio & Stats
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                </aside>
            </div>

            {/* Playlist modal */}
            {showPlaylistModal && (
                <AddToPlaylistModal
                    song={currentSong}
                    onClose={() => setShowPlaylistModal(false)}
                />
            )}
        </>
    );
}
