import express from "express";
import musicController from "../controllers/music.controller.js";
import multer from "multer";


const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage()
})

router.post('/upload-music', upload.single("music"),  musicController.addingMusic )

export default router;