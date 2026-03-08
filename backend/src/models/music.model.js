import mongoose from "mongoose";

const musicSchema = new mongoose.Schema({
    uri: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    coverArt: {
        type: String,
        default: null
    },
    genre: {
        type: String,
        default: ""
    },
    mood: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    visibility: {
        type: String,
        enum: ["public", "draft", "private"],
        default: "public"
    },
    likesCount: {
        type: Number,
        default: 0
    },
    playsCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

const musicModel = mongoose.model('music', musicSchema);

export default musicModel