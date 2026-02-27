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
        console.log("User already exists");
        return res.status(409).json({
            message: "User already exists"
        })
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
        username,
        email,
        password: hash,
        role
    })

    const token = jwt.sign({
        id: user._id,
        role: user.role
    }, process.env.JWT_SECRET)

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,        // required for HTTPS (Render uses HTTPS)
        sameSite: "none"     // required for cross-site cookies
    })
    // attempt to deliver welcome email before finalizing response
    try {
        await emailService.sendRegistrationEmail(user.email, user.username);
    } catch (emailError) {
        // log the failure and include a flag in the response; user is still created
        console.error('registration email failed:', emailError);
        return res.status(201).json({
            message: "User registered successfully, but welcome email could not be sent",
            user,
            emailError: emailError.message || 'unknown'
        });
    }

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
     await emailService.sendRegistrationEmail(user.email, user.username);
    console.log({
        message: "Login successful",
        username: user.username,
        email: user.email,
        role: user.role
    })
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