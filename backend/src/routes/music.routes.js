import express from "express";
import musicController from "../controllers/music.controller.js";
import multer from "multer";


const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage()
})

router.post('/upload-music', upload.fields([
    { name: 'music', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), musicController.addingMusic)
router.get('/list-musics', musicController.listMusic)
router.patch('/:id', musicController.updateMusic)
router.post('/:id/cover', upload.single("cover"), musicController.uploadCoverArt)
router.delete('/:id', musicController.deleteMusic)
router.post('/:id/play', musicController.recordPlay)

export default router;