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
    isVerified:{type: Boolean, default: false} ,
    otpExpiry: Date,
})

const userModel = mongoose.model("user", userSchema);
export default userModel;