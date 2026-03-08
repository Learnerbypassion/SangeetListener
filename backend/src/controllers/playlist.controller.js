import playlistModel from "../models/playlist.model.js";
import userModel from "../models/user.model.js";
import { uploadImage } from "../services/storage.service.js";

export const createPlaylist = async (req, res) => {
    try {
        const { name, description, isPublic, genre } = req.body;
        if (!name) return res.status(400).json({ message: "Name is required" });

        const playlist = await playlistModel.create({
            name,
            description,
            genre,
            isPublic: isPublic === true || isPublic === 'true',
            author: req.user.id
        });

        res.status(201).json({ playlist });
    } catch (error) {
        console.error("Error creating playlist:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getPlaylists = async (req, res) => {
    try {
        // Fetch user's own playlists
        const playlists = await playlistModel.find({
            author: req.user.id
        }).populate("author", "username avatarUrl").populate("songs", "title coverUrl artist");

        res.status(200).json({ playlists });
    } catch (error) {
        console.error("Error fetching playlists:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getPlaylistById = async (req, res) => {
    try {
        const playlist = await playlistModel.findById(req.params.id)
            .populate("author", "username avatarUrl")
            .populate("songs");

        if (!playlist) return res.status(404).json({ message: "Playlist not found" });

        // Access control: only author or if it's public
        if (!playlist.isPublic && playlist.author._id.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json({ playlist });
    } catch (error) {
        console.error("Error fetching playlist:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updatePlaylist = async (req, res) => {
    try {
        const { name, description, genre, isPublic } = req.body;
        const playlist = await playlistModel.findById(req.params.id);

        if (!playlist) return res.status(404).json({ message: "Playlist not found" });

        // Access control: only author can edit
        if (playlist.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (name) playlist.name = name;
        if (description !== undefined) playlist.description = description;
        if (genre !== undefined) playlist.genre = genre;
        if (isPublic !== undefined) playlist.isPublic = isPublic;

        await playlist.save();
        res.status(200).json({ playlist });
    } catch (error) {
        console.error("Error updating playlist:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updatePlaylistCover = async (req, res) => {
    try {
        const playlist = await playlistModel.findById(req.params.id);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });

        if (playlist.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (req.file) {
            const uploadResult = await uploadImage(req.file.buffer);
            playlist.coverUrl = uploadResult.url;
            await playlist.save();
            return res.status(200).json({ playlist });
        }

        res.status(400).json({ message: "No image provided" });
    } catch (error) {
        console.error("Error uploading cover:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const addSongToPlaylist = async (req, res) => {
    try {
        const { id, songId } = req.params;
        const playlist = await playlistModel.findById(id);

        if (!playlist) return res.status(404).json({ message: "Playlist not found" });
        if (playlist.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (!playlist.songs.includes(songId)) {
            playlist.songs.push(songId);
            await playlist.save();
        }
        res.status(200).json({ playlist });
    } catch (error) {
        console.error("Error adding song:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const removeSongFromPlaylist = async (req, res) => {
    try {
        const { id, songId } = req.params;
        const playlist = await playlistModel.findById(id);

        if (!playlist) return res.status(404).json({ message: "Playlist not found" });
        if (playlist.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        playlist.songs = playlist.songs.filter(s => s.toString() !== songId);
        await playlist.save();

        res.status(200).json({ playlist });
    } catch (error) {
        console.error("Error removing song:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deletePlaylist = async (req, res) => {
    try {
        const playlist = await playlistModel.findById(req.params.id);

        if (!playlist) return res.status(404).json({ message: "Playlist not found" });
        if (playlist.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await playlistModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Playlist deleted" });
    } catch (error) {
        console.error("Error deleting playlist:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getPopularPublicPlaylists = async (req, res) => {
    try {
        const playlists = await playlistModel.find({ isPublic: true })
            .populate("author", "username avatarUrl")
            .populate("songs", "title coverUrl artist")
            .limit(10)
            .sort({ createdAt: -1 });

        res.status(200).json({ playlists });
    } catch (error) {
        console.error("Error fetching popular public playlists:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getPlaylistsByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await userModel.findOne({ username });
        if (!user) return res.status(404).json({ message: "Artist not found" });

        const playlists = await playlistModel.find({
            author: user._id,
            isPublic: true
        }).populate("author", "username avatarUrl").populate("songs", "title coverUrl artist");

        res.status(200).json({ playlists });
    } catch (error) {
        console.error("Error fetching user playlists:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const playlistController = {
    createPlaylist,
    getPlaylists,
    getPlaylistById,
    updatePlaylist,
    updatePlaylistCover,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    getPopularPublicPlaylists,
    getPlaylistsByUsername
};

export default playlistController;
