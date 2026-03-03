import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import emailService from "../services/email.service.js";

const verifyUser = (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded }); // contains id + role
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (!user.otpExpiry || user.otpExpiry < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  // ✅ Mark verified
  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      username: user.username
    },
    process.env.JWT_SECRET,
    {expiresIn: "3d"}
  );

  const isProduction = true;

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction, // must be true in production (HTTPS)
    maxAge: 3 * 24 * 60 * 60 * 1000 // optional: 7 days
  });

  try {
    await emailService.sendRegistrationEmail(user.email, user.username);
  } catch (err) {
    console.log("Registration email error:", err);
  }

  res.status(200).json({
    message: "Email verified & account activated",
    username: user.username,
    email: user.email,
    role: user.role
  });
};


export default {
  verifyUser,
  verifyOtp
};

