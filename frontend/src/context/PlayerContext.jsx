import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { getStreamUrl } from "../api/music";
import api from "../api/axiosInstance";
import { useAuth } from "./AuthContext";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
    const [currentSong, setCurrentSong] = useState(null);
    const [queue, setQueue] = useState([]);
    const [originalQueue, setOriginalQueue] = useState([]);
    const [queueIndex, setQueueIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [shuffle, setShuffle] = useState(false);
    const [repeat, setRepeat] = useState("off"); // off, one, all
    const audioRef = useRef(null);

    const { profile, isAuthenticated } = useAuth();

    // Recently Played History
    const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
        try {
            const saved = localStorage.getItem("sangeet_recently_played");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const addRecentlyPlayed = useCallback((song) => {
        if (!song) return;
        setRecentlyPlayed(prev => {
            const filtered = prev.filter(s => (s._id || s.id) !== (song._id || song.id));
            const updated = [song, ...filtered].slice(0, 15);
            try {
                localStorage.setItem("sangeet_recently_played", JSON.stringify(updated));
            } catch (e) {
                console.error("Failed to save recently played locally");
            }
            return updated;
        });
    }, []);

    // Feature 4: Liked songs (Cloud-backed)
    const [likedIds, setLikedIds] = useState(new Set());

    useEffect(() => {
        if (isAuthenticated && profile?.likedSongs) {
            setLikedIds(new Set(profile.likedSongs));
        } else if (!isAuthenticated) {
            setLikedIds(new Set());
        }
    }, [isAuthenticated, profile?.likedSongs]);

    const toggleLike = useCallback(async (songId) => {
        if (!songId || !isAuthenticated) {
            // Optional: trigger login prompt
            return;
        }

        // Optimistic UI update
        setLikedIds((prev) => {
            const next = new Set(prev);
            if (next.has(songId)) next.delete(songId);
            else next.add(songId);
            return next;
        });

        try {
            await api.post(`/api/user/likes/${songId}`);
        } catch (error) {
            console.error("Failed to sync like status:", error);
            // Revert on failure
            setLikedIds((prev) => {
                const next = new Set(prev);
                if (next.has(songId)) next.delete(songId);
                else next.add(songId);
                return next;
            });
        }
    }, [isAuthenticated]);

    // Create audio element once
    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.volume = 0.7;

        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            setProgress(audio.currentTime);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            if (repeat === "one") {
                audio.currentTime = 0;
                audio.play();
            } else {
                skipNext();
            }
        };

        const handleError = (e) => {
            console.error("Audio error:", e);
            setIsPlaying(false);
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("error", handleError);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("error", handleError);
            audio.pause();
            audio.src = "";
        };
    }, []);


    const playSong = useCallback((song, songList = []) => {
        if (!audioRef.current) return;
        const url = getStreamUrl(song);
        if (!url) return;

        audioRef.current.src = url;
        audioRef.current.play().catch(console.error);
        setCurrentSong(song);
        setIsPlaying(true);
        addRecentlyPlayed(song);

        const songId = song._id || song.id;
        if (songId) {
            api.post(`/api/music/${songId}/play`).catch(console.error);
        }

        if (songList.length > 0) {
            setOriginalQueue(songList);
            if (shuffle) {
                const remaining = songList.filter(s => (s._id || s.id) !== (song._id || song.id));
                const shuffled = [...remaining].sort(() => Math.random() - 0.5);
                setQueue([song, ...shuffled]);
                setQueueIndex(0);
            } else {
                setQueue(songList);
                const idx = songList.findIndex((s) => (s._id || s.id) === (song._id || song.id));
                setQueueIndex(idx >= 0 ? idx : 0);
            }
        } else if (songList.length === 0 && queue.length === 0) {
            setQueue([song]);
            setOriginalQueue([song]);
            setQueueIndex(0);
        }
    }, [shuffle]);

    const togglePlay = useCallback(() => {
        if (!audioRef.current || !currentSong) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(console.error);
            setIsPlaying(true);
        }
    }, [isPlaying, currentSong]);

    const seek = useCallback((time) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = time;
        setProgress(time);
    }, []);

    const changeVolume = useCallback((v) => {
        if (!audioRef.current) return;
        const clamped = Math.max(0, Math.min(1, v));
        audioRef.current.volume = clamped;
        setVolume(clamped);
    }, []);

    const skipNext = useCallback(() => {
        if (queue.length === 0) return;
        let nextIdx = queueIndex + 1;
        if (nextIdx >= queue.length) {
            if (repeat === "all") nextIdx = 0;
            else {
                setIsPlaying(false);
                return;
            }
        }

        setQueueIndex(nextIdx);
        const nextSong = queue[nextIdx];
        if (nextSong) {
            const url = getStreamUrl(nextSong);
            if (url && audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play().catch(console.error);
                setCurrentSong(nextSong);
                setIsPlaying(true);
            }
        }
    }, [queue, queueIndex, repeat]);

    const skipPrev = useCallback(() => {
        if (!audioRef.current) return;
        if (audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }
        if (queue.length === 0) return;
        let prevIdx = queueIndex - 1;
        if (prevIdx < 0) {
            if (repeat === "all") prevIdx = queue.length - 1;
            else {
                audioRef.current.currentTime = 0;
                return;
            }
        }

        setQueueIndex(prevIdx);
        const prevSong = queue[prevIdx];
        if (prevSong) {
            const url = getStreamUrl(prevSong);
            if (url) {
                audioRef.current.src = url;
                audioRef.current.play().catch(console.error);
                setCurrentSong(prevSong);
                setIsPlaying(true);
            }
        }
    }, [queue, queueIndex, repeat]);

    // Update ended handler when repeat/queue changes
    useEffect(() => {
        if (!audioRef.current) return;
        const audio = audioRef.current;
        const handleEnded = () => {
            if (repeat === "one") {
                audio.currentTime = 0;
                audio.play();
            } else {
                skipNext();
            }
        };
        audio.addEventListener("ended", handleEnded);
        return () => audio.removeEventListener("ended", handleEnded);
    }, [repeat, skipNext]);

    const toggleShuffle = useCallback(() => {
        setShuffle((prevShuffle) => {
            const nextShuffle = !prevShuffle;

            if (nextShuffle && queue.length > 0) {
                // Turning shuffle ON: Shuffle the current queue, keeping current song at index 0
                const remaining = queue.filter(s => (s._id || s.id) !== (currentSong?._id || currentSong?.id));
                const shuffled = [...remaining].sort(() => Math.random() - 0.5);
                const newQueue = currentSong ? [currentSong, ...shuffled] : shuffled;
                setQueue(newQueue);
                setQueueIndex(currentSong ? 0 : -1);
            } else if (!nextShuffle && originalQueue.length > 0) {
                // Turning shuffle OFF: Restore original queue
                setQueue(originalQueue);
                const currIdx = originalQueue.findIndex(s => (s._id || s.id) === (currentSong?._id || currentSong?.id));
                setQueueIndex(Math.max(0, currIdx));
            }
            return nextShuffle;
        });
    }, [queue, currentSong, originalQueue]);

    const toggleRepeat = useCallback(() => {
        setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));
    }, []);

    const addToQueue = useCallback((song) => {
        if (!song) return;
        setQueue((prev) => [...prev, song]);
        setOriginalQueue((prev) => [...prev, song]);
    }, []);

    return (
        <PlayerContext.Provider
            value={{
                currentSong,
                isPlaying,
                progress,
                duration,
                volume,
                shuffle,
                repeat,
                queue,
                queueIndex,
                likedIds,
                recentlyPlayed,
                playSong,
                togglePlay,
                seek,
                setVolume: changeVolume,
                skipNext,
                skipPrev,
                toggleShuffle,
                toggleRepeat,
                toggleLike,
                addToQueue,
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const ctx = useContext(PlayerContext);
    if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
    return ctx;
}
