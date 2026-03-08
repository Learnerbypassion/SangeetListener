import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../../context/PlayerContext";
import { normalizeSong } from "../../utils/normalizeSong";

export default function SongCard({ song: rawSong, songList = [], showArtist = true, isOwner = false, onEdit, onDelete }) {
    const navigate = useNavigate();
    const song = normalizeSong(rawSong);
    const { playSong, currentSong, isPlaying, likedIds, toggleLike } = usePlayer();
    const isActive = currentSong?._id === song._id;
    const isCurrentlyPlaying = isActive && isPlaying;
    const isLiked = likedIds?.has(song._id);

    const handlePlay = () => {
        playSong(rawSong, songList);
    };

    return (
        <div
            className="group relative flex flex-col gap-2 cursor-pointer w-40 sm:w-44 flex-shrink-0 transition-transform duration-200 ease-out hover:scale-[1.03]"
            onClick={handlePlay}
        >
            {/* Cover art */}
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-surface-dark shadow-md group-hover:shadow-xl group-hover:shadow-primary/10 transition-shadow duration-300">
                {song.coverUrl ? (
                    <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-charcoal">
                        <span className="material-symbols-outlined text-4xl text-primary/30">music_note</span>
                    </div>
                )}

                {/* Play button — slides up on hover */}
                <div className="absolute bottom-2 right-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined text-background-dark text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {isCurrentlyPlaying ? "pause" : "play_arrow"}
                        </span>
                    </div>
                </div>

                {/* Like button — top right (hide if owner) */}
                {!isOwner && (
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(song._id); }}
                        className={`absolute top-2 right-2 p-1.5 rounded-full transition-all cursor-pointer hover:scale-110 active:scale-90 ${isLiked ? "text-primary opacity-100" : "text-white/80 hover:text-primary bg-black/30 opacity-0 group-hover:opacity-100"
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>
                            {isLiked ? "favorite" : "favorite_border"}
                        </span>
                    </button>
                )}

                {/* Now playing badge */}
                {isCurrentlyPlaying && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-primary text-background-dark text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-sm animate-pulse">graphic_eq</span>
                        Playing
                    </div>
                )}

                {/* Owner actions (edit/delete) */}
                {isOwner && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit?.(rawSong); }}
                            className="w-7 h-7 bg-charcoal/90 rounded-full flex items-center justify-center text-white hover:text-primary transition-colors cursor-pointer"
                            data-tooltip="Edit"
                        >
                            <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete?.(rawSong); }}
                            className="w-7 h-7 bg-charcoal/90 rounded-full flex items-center justify-center text-white hover:text-red-400 transition-colors cursor-pointer"
                            data-tooltip="Delete"
                        >
                            <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="px-0.5 w-full">
                <p className={`text-sm font-semibold truncate leading-tight ${isActive ? "text-primary" : "text-white"}`}>
                    {song.title}
                </p>
                {showArtist && (
                    <p
                        className="text-xs text-slate-400 truncate hover:text-primary hover:underline transition-colors cursor-pointer inline-block"
                        onClick={(e) => { e.stopPropagation(); navigate(`/artist/${encodeURIComponent(song.artistName)}`); }}
                    >
                        {song.artistName}
                    </p>
                )}
            </div>
        </div>
    );
}
