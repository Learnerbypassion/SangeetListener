import musicModel from "../models/music.model.js";
import jwt from "jsonwebtoken"
import { uploadMusic, uploadImage } from "../services/storage.service.js"


const addingMusic = async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized By token"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'Artist') {
            return res.status(403).json({ message: "You don't have access to create the music" })
        }

        const { title, genre, mood, description, visibility } = req.body;
        const isMusicExists = await musicModel.findOne({ title })
        if (isMusicExists) { return res.status(401).json({ message: "Music is already in the library" }); }

        if (!req.files || !req.files.music) {
            return res.status(400).json({ message: "No audio file provided" });
        }

        const musicFile = req.files.music[0];
        const musicResult = await uploadMusic(musicFile.buffer);

        let coverUrl = undefined;
        if (req.files.image && req.files.image.length > 0) {
            const imageResult = await uploadImage(req.files.image[0].buffer);
            coverUrl = imageResult.url;
        }

        const music = await musicModel.create({
            uri: musicResult.url,
            coverArt: coverUrl,
            title: title,
            genre: genre || "",
            mood: mood || "",
            description: description || "",
            visibility: visibility || "public",
            artist: decoded.id,
        })

        console.log("Uploaded music: ", music.title, " coverUrl: ", !!music.coverArt);
        res.status(201).json({
            message: "Music Created Successfully",
            music,
            username: decoded.username
        })
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Music Controller falied" })
    }
}


const listOfMusic = async (req, res) => {
    const musics = await musicModel.find().populate("artist", "username");
    res.send({
        message: "This are the musics",
        musics: musics
    })
}

// Update song metadata (title, genre, description, visibility)
const updateMusic = async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const music = await musicModel.findById(req.params.id);
        if (!music) {
            return res.status(404).json({ message: "Music not found" });
        }
        // Only the artist who uploaded can edit
        if (music.artist.toString() !== decoded.id) {
            return res.status(403).json({ message: "You can only edit your own music" });
        }

        const { title, genre, description, visibility, mood } = req.body;
        if (title !== undefined) music.title = title;
        if (genre !== undefined) music.genre = genre;
        if (mood !== undefined) music.mood = mood;
        if (description !== undefined) music.description = description;
        if (visibility !== undefined) music.visibility = visibility;

        await music.save();
        const updated = await musicModel.findById(music._id).populate("artist", "username");
        res.json({ message: "Music updated", music: updated });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to update music" });
    }
}

export const listMusic = async (req, res) => {
    try {
        const musics = await musicModel.find({})
            .populate("artist", "username bio avatarUrl")
            .sort({ createdAt: -1 });

        res.status(200).json({ musics });
    } catch (error) {
        console.error("Error fetching music:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const recordPlay = async (req, res) => {
    try {
        const { id } = req.params;
        const music = await musicModel.findById(id);

        if (!music) {
            return res.status(404).json({ message: "Song not found" });
        }

        music.playsCount = (music.playsCount || 0) + 1;
        await music.save();

        res.status(200).json({ playsCount: music.playsCount });
    } catch (error) {
        console.error("Error recording play:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Upload cover art for a song
const uploadCoverArt = async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const music = await musicModel.findById(req.params.id);
        if (!music) {
            return res.status(404).json({ message: "Music not found" });
        }
        if (music.artist.toString() !== decoded.id) {
            return res.status(403).json({ message: "You can only edit your own music" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const result = await uploadImage(req.file.buffer);
        music.coverArt = result.url;
        await music.save();
        const updated = await musicModel.findById(music._id).populate("artist", "username");
        res.json({ message: "Cover art updated", music: updated });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to upload cover art" });
    }
}

// Delete a song
const deleteMusic = async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const music = await musicModel.findById(req.params.id);
        if (!music) {
            return res.status(404).json({ message: "Music not found" });
        }
        if (music.artist.toString() !== decoded.id) {
            return res.status(403).json({ message: "You can only delete your own music" });
        }
        await musicModel.findByIdAndDelete(req.params.id);
        res.json({ message: "Music deleted" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to delete music" });
    }
}

export default { addingMusic, listOfMusic, updateMusic, uploadCoverArt, deleteMusic, listMusic, recordPlay }