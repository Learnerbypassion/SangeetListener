import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["User", "Artist"],
        default: "User"
    },
    otp: String,
    isVerified: { type: Boolean, default: false },
    otpExpiry: Date,
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'music' }],
    savedPlaylists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'playlist' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }]
})

const userModel = mongoose.model("user", userSchema);
export default userModel;