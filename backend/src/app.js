import express from "express";
import dotenv from "dotenv";
dotenv.config();
import authRoutes from "./routes/auth.routes.js";
import musicRoutes from "./routes/music.routes.js"
import cookieParser from "cookie-parser";
import verifyRoutes from "./routes/verify.routes.js"
import cors from "cors"
const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    origin: "https://sangeetlistener.netlify.app",
    credentials: true
}))
app.use(cookieParser())
app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.get('/api/auth/verify', verifyRoutes)



app.get('/',(req, res)=>{
    res.send(
        "<h1>Welcome to Snageet Listener API</h1>"
    );
})

export default app;