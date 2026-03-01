import bcrypt from "bcryptjs";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken"
import emailService from "../services/email.service.js";

//Register api
const registerUser = async (req, res) => {
    const { username, email, password, role = 'User' } = req.body
    const isUserAlreadyExists = await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    })
    if (isUserAlreadyExists) {
        // 🟡 Case: user exists but NOT verified
        if (!isUserAlreadyExists.isVerified) {
            const otp = Math.floor(1000 + Math.random() * 9000).toString();

            isUserAlreadyExists.otp = otp;
            isUserAlreadyExists.otpExpiry = Date.now() + 5 * 60 * 1000;
            await isUserAlreadyExists.save();

            await emailService.sendOtpEmail(
                isUserAlreadyExists.email,
                isUserAlreadyExists.username,
                otp
            );

            return res.status(200).json({
                message: "OTP re-sent. Please verify your email",
                email: isUserAlreadyExists.email
            });
        }
        console.log("User already exists");
        return res.status(409).json({
            message: "User already exists"
        })
    }
    const hash = await bcrypt.hash(password, 10);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const user = await userModel.create({
        username,
        email,
        password: hash,
        role,
        otp,
        otpExpiry:  Date.now() + 5 * 60 * 1000 // 5 min expiry
    })

    try {
        await emailService.sendOtpEmail(user.email, user.username, otp);
        console.log("Otp sent");
        
    } catch (error) {
        console.log("otp can not be sent", error);
    }
    // attempt to deliver welcome email before finalizing response
    res.status(201).json({
        message: "User registered successfully",
        user
    });
    
}


//Login api
const loginUser = async (req, res) => {
    const { username, email, password } = req.body;

    //checking if there is any user or not
    const user = await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    })
    if (!user) {
        return res.status(401).json({
            message: "Invalid Credentials! REGISTER NOW"
        })
    }
    if(!user.isVerified){
        return res.status(400).json({
            message: "User is not Verified"
        })
    }

    //checking if the given password is correct or not
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
        return res.status(409).json({ message: "Invalid Password" })
    }
    //sending the token to the client
    const token = jwt.sign({
        id: user._id,
        role: user.role,
        username: user.username
    }, process.env.JWT_SECRET)
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,        // required for HTTPS (Render uses HTTPS)
        sameSite: "none"     // required for cross-site cookies
    });


    res.status(201).json({
        message: "Login successful",
        username: user.username,
        email: user.email,
        role: user.role
    })
    try {
        await emailService.sendLoginEmail(user.email, user.username);
        console.log("Email sent")
    } catch (error) {
        console.log("Log in email sent faliure", error);
        
    }
    
}

//Logout api
const logoutUser = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false, // true in production (HTTPS)
        sameSite: "none",
    });

    res.status(200).json({
        message: "Logged out successfully",
    });
};


export default { registerUser, loginUser, logoutUser };