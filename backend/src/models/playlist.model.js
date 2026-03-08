import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    genre: {
        type: String,
        default: ""
    },
    coverUrl: {
        type: String,
        default: ""
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "music"
    }],
    isPublic: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const playlistModel = mongoose.model("playlist", playlistSchema);
export default playlistModel;
