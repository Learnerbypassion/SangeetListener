import { useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../../context/PlayerContext";
import { normalizeSong } from "../../utils/normalizeSong";
import ImmersivePlayer from "../Player/ImmersivePlayer";
import { AddToPlaylistModal } from "../Playlist/AddToPlaylistModal";

function formatTime(s) {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
}

/* ── Normal progress bar ─────────────────────────────── */
function NormalProgress({ progress, duration, onSeek }) {
    const containerRef = useRef(null);
    const pct = duration > 0 ? (progress / duration) * 100 : 0;

    const handleClick = useCallback((e) => {
        const rect = containerRef.current.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        onSeek(pos * duration);
    }, [duration, onSeek]);

    return (
        <div
            ref={containerRef}
            className="flex-1 h-4 flex items-center cursor-pointer group relative"
            onClick={handleClick}
        >
            <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary rounded-full relative"
                    style={{ width: `${pct}%` }}
                />
            </div>
            {/* Thumb */}
            <div
                className="absolute w-3 h-3 bg-white rounded-full top-1/2 -translate-y-1/2 -ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md"
                style={{ left: `${pct}%` }}
            />
        </div>
    );
}

function QueueItem({ song, active }) {
    const s = normalizeSong(song);
    return (
        <div className={`flex items-center gap-3 p-2 rounded-lg ${active ? "bg-primary/10 border border-primary/20" : "hover:bg-white/5"} transition-colors cursor-pointer`}>
            <div className="w-10 h-10 rounded-lg bg-border-dark overflow-hidden flex-shrink-0">
                {s.coverUrl ? (
                    <img src={s.coverUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary/40">music_note</span>
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${active ? "text-primary" : "text-white"}`}>{s.title}</p>
                <p className="text-xs text-slate-500 truncate">{s.artistName}</p>
            </div>
            {active && <span className="material-symbols-outlined text-primary text-lg animate-pulse">graphic_eq</span>}
        </div>
    );
}

export default function PlayerBar() {
    const navigate = useNavigate();
    const {
        currentSong,
        isPlaying,
        progress,
        duration,
        volume,
        shuffle,
        repeat,
        queue,
        queueIndex,
        togglePlay,
        seek,
        setVolume,
        skipNext,
        skipPrev,
        toggleShuffle,
        toggleRepeat,
        likedIds,
        toggleLike,
        addToQueue,
    } = usePlayer();

    const [immersiveOpen, setImmersiveOpen] = useState(false);
    const [queueOpen, setQueueOpen] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);

    if (!currentSong) return null;

    const isLiked = likedIds?.has(currentSong._id);
    const hasLyrics = Boolean(currentSong?.lyrics);
    const normalized = normalizeSong(currentSong);
    const artistName = normalized.artistName;

    return (
        <>
            <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-50 bg-charcoal/95 backdrop-blur-md border-t border-border-dark">
                <div className="flex items-center justify-between px-4 lg:px-6 py-2.5">
                    {/* LEFT — Song info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1 lg:flex-initial lg:w-[280px]">
                        <div
                            onClick={() => setImmersiveOpen(true)}
                            className="w-12 h-12 rounded-lg bg-surface-dark overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            {normalized.coverUrl ? (
                                <img src={normalized.coverUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary/40">music_note</span>
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{currentSong.title}</p>
                            <p
                                className="text-xs text-slate-400 truncate hover:text-primary hover:underline transition-colors cursor-pointer inline-block"
                                onClick={(e) => { e.stopPropagation(); navigate(`/artist/${encodeURIComponent(artistName)}`); }}
                            >
                                {artistName}
                            </p>
                        </div>
                        <button
                            onClick={() => toggleLike(currentSong._id)}
                            className={`flex-shrink-0 transition-all hover:scale-110 active:scale-90 cursor-pointer ${isLiked ? "text-primary" : "text-slate-500 hover:text-white"}`}
                            data-tooltip={isLiked ? "Unlike" : "Like"}
                        >
                            <span
                                className="material-symbols-outlined text-xl"
                                style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
                            >
                                {isLiked ? "favorite" : "favorite_border"}
                            </span>
                        </button>
                    </div>

                    {/* CENTER — Transport + waveform progress */}
                    <div className="hidden md:flex flex-col items-center gap-1 flex-1 max-w-2xl">
                        <div className="flex items-center gap-5">
                            <button onClick={toggleShuffle} className={`p-2 rounded-full transition-all cursor-pointer hover:scale-110 active:scale-90 ${shuffle ? "text-primary" : "text-slate-400 hover:text-white"}`} data-tooltip="Shuffle">
                                <span className="material-symbols-outlined text-xl">shuffle</span>
                            </button>
                            <button onClick={skipPrev} className="p-2 rounded-full text-slate-300 hover:text-white transition-all cursor-pointer hover:scale-110 active:scale-90" data-tooltip="Previous">
                                <span className="material-symbols-outlined text-2xl">skip_previous</span>
                            </button>
                            <button onClick={togglePlay} className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-background-dark hover:shadow-[0_0_15px_rgba(244,195,47,0.4)] active:scale-90 transition-all cursor-pointer">
                                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {isPlaying ? "pause" : "play_arrow"}
                                </span>
                            </button>
                            <button onClick={skipNext} className="p-2 rounded-full text-slate-300 hover:text-white transition-all cursor-pointer hover:scale-110 active:scale-90" data-tooltip="Next">
                                <span className="material-symbols-outlined text-2xl">skip_next</span>
                            </button>
                            <button onClick={toggleRepeat} className={`p-2 rounded-full transition-all cursor-pointer hover:scale-110 active:scale-90 relative ${repeat !== "off" ? "text-primary" : "text-slate-400 hover:text-white"}`} data-tooltip="Repeat">
                                <span className="material-symbols-outlined text-xl">{repeat === "one" ? "repeat_one" : "repeat"}</span>
                                {repeat !== "off" && <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />}
                            </button>
                        </div>

                        {/* Waveform progress */}
                        <div className="hidden lg:flex items-center gap-3 w-full">
                            <span className="text-[10px] text-slate-500 font-mono w-10 text-right">{formatTime(progress)}</span>
                            <NormalProgress progress={progress} duration={duration} onSeek={seek} />
                            <span className="text-[10px] text-slate-500 font-mono w-10">{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Mobile transport controls */}
                    <div className="md:hidden flex items-center justify-end gap-1 flex-1">
                        <button onClick={skipPrev} className="p-2 rounded-full text-slate-300 hover:text-white active:scale-90 transition-all cursor-pointer">
                            <span className="material-symbols-outlined text-2xl">skip_previous</span>
                        </button>
                        <button onClick={togglePlay} className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-background-dark active:scale-90 transition-all cursor-pointer flex-shrink-0">
                            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {isPlaying ? "pause" : "play_arrow"}
                            </span>
                        </button>
                        <button onClick={skipNext} className="p-2 rounded-full text-slate-300 hover:text-white active:scale-90 transition-all cursor-pointer">
                            <span className="material-symbols-outlined text-2xl">skip_next</span>
                        </button>
                    </div>

                    {/* RIGHT — Actions */}
                    <div className="hidden lg:flex items-center gap-1 w-[260px] justify-end relative">
                        {/* Add to playlist */}
                        <button
                            onClick={() => setShowPlaylistModal(true)}
                            className="p-2 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer hover:scale-110 active:scale-90"
                            data-tooltip="Add to playlist"
                        >
                            <span className="material-symbols-outlined text-xl">playlist_add</span>
                        </button>

                        {/* Add to queue */}
                        {addToQueue && (
                            <button
                                onClick={() => addToQueue(currentSong)}
                                className="p-2 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer hover:scale-110 active:scale-90"
                                data-tooltip="Add to queue"
                            >
                                <span className="material-symbols-outlined text-xl">add_to_queue</span>
                            </button>
                        )}

                        {/* Lyrics */}
                        <button
                            onClick={() => hasLyrics && setImmersiveOpen(true)}
                            disabled={!hasLyrics}
                            className={`p-2 rounded-full transition-all ${hasLyrics ? "text-slate-400 hover:text-white cursor-pointer" : "text-slate-600 cursor-not-allowed opacity-40"}`}
                            data-tooltip={hasLyrics ? "Lyrics" : "No lyrics"}
                        >
                            <span className="material-symbols-outlined text-xl">lyrics</span>
                        </button>

                        {/* Queue button */}
                        <button
                            onClick={() => setQueueOpen((o) => !o)}
                            className={`p-2 rounded-full transition-all cursor-pointer hover:scale-110 active:scale-90 ${queueOpen ? "text-primary" : "text-slate-400 hover:text-white"}`}
                            data-tooltip="Queue"
                        >
                            <span className="material-symbols-outlined text-xl">queue_music</span>
                        </button>

                        {/* Volume */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                                className="p-2 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer active:scale-90"
                                data-tooltip="Volume"
                            >
                                <span className="material-symbols-outlined text-xl">
                                    {volume === 0 ? "volume_off" : volume < 0.5 ? "volume_down" : "volume_up"}
                                </span>
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume * 100}
                                onChange={(e) => setVolume(Number(e.target.value) / 100)}
                                className="w-20 h-1 accent-primary cursor-pointer"
                            />
                        </div>

                        {/* Expand */}
                        <button
                            onClick={() => setImmersiveOpen(true)}
                            className="p-2 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer hover:scale-110 active:scale-90"
                            data-tooltip="Full screen"
                        >
                            <span className="material-symbols-outlined text-xl">open_in_full</span>
                        </button>

                        {/* Queue panel */}
                        {queueOpen && (
                            <div className="absolute bottom-full right-0 w-80 bg-charcoal border border-border-dark rounded-t-2xl shadow-2xl mb-0 max-h-[60vh] flex flex-col">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-border-dark">
                                    <h3 className="text-white font-bold text-sm">Queue</h3>
                                    <span className="text-slate-500 text-xs">
                                        {Math.max(0, queue.length - queueIndex - 1)} up next
                                    </span>
                                </div>
                                <div className="overflow-y-auto flex-1 p-3 space-y-1">
                                    {queue[queueIndex] && (
                                        <div className="mb-3">
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 px-2">Now Playing</p>
                                            <QueueItem song={queue[queueIndex]} active />
                                        </div>
                                    )}
                                    {queue.slice(queueIndex + 1).length > 0 && (
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 px-2">Up Next</p>
                                            {queue.slice(queueIndex + 1).map((song, i) => (
                                                <QueueItem key={(song._id || i) + "-q"} song={song} />
                                            ))}
                                        </div>
                                    )}
                                    {queue.length === 0 && (
                                        <p className="text-slate-500 text-sm text-center py-8">Queue is empty</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Immersive player overlay */}
            {immersiveOpen && <ImmersivePlayer onClose={() => setImmersiveOpen(false)} />}

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
