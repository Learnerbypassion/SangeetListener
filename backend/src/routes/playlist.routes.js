import express from "express";
import playlistController from "../controllers/playlist.controller.js";
import multer from "multer";
import { authUser } from "../middleware/authUser.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/public/popular", playlistController.getPopularPublicPlaylists);
router.get("/artist/:username", playlistController.getPlaylistsByUsername);

router.post("/", authUser, playlistController.createPlaylist);
router.get("/", authUser, playlistController.getPlaylists);
router.get("/:id", authUser, playlistController.getPlaylistById);
router.put("/:id", authUser, playlistController.updatePlaylist);
router.put("/:id/cover", authUser, upload.single("cover"), playlistController.updatePlaylistCover);
router.post("/:id/songs/:songId", authUser, playlistController.addSongToPlaylist);
router.delete("/:id/songs/:songId", authUser, playlistController.removeSongFromPlaylist);
router.delete("/:id", authUser, playlistController.deletePlaylist);

export default router;
