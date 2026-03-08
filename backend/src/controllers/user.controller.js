import userModel from "../models/user.model.js";
import musicModel from "../models/music.model.js";
import { uploadImage } from "../services/storage.service.js";

export const getProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select("-password -otp -otpExpiry");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getLibrary = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id)
            .populate({ path: "following", select: "username avatarUrl role", match: { role: "Artist" } })
            .populate({
                path: "savedPlaylists",
                populate: { path: "author", select: "username avatarUrl" }
            });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            artists: user.following || [],
            playlists: user.savedPlaylists || []
        });
    } catch (error) {
        console.error("Error fetching library:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { bio, username } = req.body;
        const updates = {};
        if (bio !== undefined) updates.bio = bio;
        if (username !== undefined) updates.username = username;

        if (req.file) {
            const uploadResult = await uploadImage(req.file.buffer);
            updates.avatarUrl = uploadResult.url;
        }

        const user = await userModel.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
        res.status(200).json({ message: "Profile updated", user });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const toggleLike = async (req, res) => {
    try {
        const { songId } = req.params;
        const user = await userModel.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        const index = user.likedSongs.indexOf(songId);
        let added = false;

        const music = await musicModel.findById(songId);

        if (index === -1) {
            user.likedSongs.push(songId);
            added = true;
            if (music) {
                music.likesCount = (music.likesCount || 0) + 1;
                await music.save();
            }
        } else {
            user.likedSongs.splice(index, 1);
            if (music) {
                music.likesCount = Math.max(0, (music.likesCount || 0) - 1);
                await music.save();
            }
        }

        await user.save();
        res.status(200).json({ message: added ? "Song liked" : "Song unliked", likedSongs: user.likedSongs, added });
    } catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getPopularArtists = async (req, res) => {
    try {
        const artists = await userModel.find({ role: "Artist" })
            .select("username avatarUrl bio")
            .limit(10)
            .sort({ createdAt: -1 });

        res.status(200).json({ artists });
    } catch (error) {
        console.error("Error fetching popular artists:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const toggleFollow = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        if (targetUserId === currentUserId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const targetUser = await userModel.findById(targetUserId);
        const currentUser = await userModel.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isFollowing = currentUser.following.includes(targetUserId);
        if (isFollowing) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
        } else {
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);
        }

        await currentUser.save();
        await targetUser.save();

        res.status(200).json({
            message: isFollowing ? "Unfollowed" : "Followed",
            isFollowing: !isFollowing,
            followersCount: targetUser.followers.length
        });
    } catch (error) {
        console.error("Error in toggleFollow:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getArtistProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const artist = await userModel.findOne({ username, role: "Artist" }).select("-password -otp -otpExpiry");
        if (!artist) return res.status(404).json({ message: "Artist not found" });
        res.status(200).json({ artist });
    } catch (error) {
        console.error("Error fetching artist profile:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const toggleSavePlaylist = async (req, res) => {
    try {
        const { id: playlistId } = req.params;
        const user = await userModel.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const index = user.savedPlaylists.indexOf(playlistId);
        let saved = false;

        if (index === -1) {
            user.savedPlaylists.push(playlistId);
            saved = true;
        } else {
            user.savedPlaylists.splice(index, 1);
        }

        await user.save();
        res.status(200).json({
            message: saved ? "Playlist saved" : "Playlist removed",
            saved
        });
    } catch (error) {
        console.error("Error toggling saved playlist:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export default { getProfile, updateProfile, toggleLike, getPopularArtists, toggleFollow, getArtistProfile, getLibrary, toggleSavePlaylist };
