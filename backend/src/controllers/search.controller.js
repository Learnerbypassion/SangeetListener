import musicModel from "../models/music.model.js";
import playlistModel from "../models/playlist.model.js";
import userModel from "../models/user.model.js";

export const searchAll = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(200).json({ songs: [], playlists: [], artists: [] });
        }

        const regex = new RegExp(q, "i");

        const [songs, playlists, artists] = await Promise.all([
            musicModel.find({
                $or: [{ title: regex }, { artistName: regex }],
            }).populate("artist", "username avatarUrl"),
            playlistModel.find({
                name: regex,
                isPublic: true,
            }).populate("author", "username avatarUrl"),
            userModel.find({
                username: regex,
                role: "Artist",
            }).select("username avatarUrl bio")
        ]);

        res.status(200).json({
            songs,
            playlists,
            artists
        });
    } catch (error) {
        console.error("Error in global search:", error);
        res.status(500).json({ message: "Server error during search" });
    }
};

export default { searchAll };
