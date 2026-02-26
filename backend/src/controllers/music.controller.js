import musicModel from "../models/music.model.js";
import jwt from "jsonwebtoken"
import { uploadMusic } from "../services/storage.service.js"


const addingMusic = async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized By token"
        })
    }     
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'Artist') {
            return res.status(403).json({ message: "You don't have access to create the music" })
        }
        console.log(decoded);
        
        const { title } = req.body;
        const isMusicExists = await musicModel.findOne({title})
        if(isMusicExists){ return res.status(401).json({message: "Music is already in the library"}); }
        const file = req.file;
        const result = await uploadMusic(file.buffer);
        const music = await musicModel.create({
            uri: result.url,
            title: title,
            artist: decoded.id,
        })
        console.log(music);
        res.status(201).json({
            message: "Music Created Successfully",
            music,
            username: decoded.username
        })
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Music Controller falied" })
    }
}


const listOfMusic = async (req,res) =>{
    const musics = await musicModel.find().populate("artist", "username");
    res.send({
        message: "This are the musics",
        musics: musics
    })
}
export default { addingMusic, listOfMusic }