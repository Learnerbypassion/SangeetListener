export function normalizeSong(s) {
    if (!s) return {};
    return {
        ...s,
        _id: s._id || s.id,
        title: s.title || "Untitled",
        coverUrl: s.coverArt || s.coverUrl || s.cover_url || s.cover || null,
        streamUrl: s.uri || s.streamUrl || s.stream_url || s.url || null,
        artistName: s.artist?.username || s.artist_name || s.artistName || "Unknown Artist",
        genre: s.genre || "",
        description: s.description || "",
        visibility: s.visibility || "public",
        play_count: s.play_count || 0,
        like_count: s.like_count || 0,
    };
}
