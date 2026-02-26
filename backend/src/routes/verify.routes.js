// GET /api/auth/verify
import jwt from "jsonwebtoken";

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
export default verifyUser;