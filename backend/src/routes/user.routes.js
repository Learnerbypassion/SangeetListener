import express from "express";
import userController from "../controllers/user.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Needs authentication middleware
import { authUser } from "../middleware/authUser.js";

router.get("/artists/popular", userController.getPopularArtists);

router.get("/profile", authUser, userController.getProfile);
router.put("/profile", authUser, upload.single("avatar"), userController.updateProfile);
router.post("/likes/:songId", authUser, userController.toggleLike);

router.get("/artist/:username", userController.getArtistProfile);
router.post("/follow/:id", authUser, userController.toggleFollow);

router.get("/library", authUser, userController.getLibrary);
router.post("/library/playlists/:id", authUser, userController.toggleSavePlaylist);

export default router;
