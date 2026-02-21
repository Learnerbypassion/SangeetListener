import ImageKit from "@imagekit/nodejs";

const privateKey = "private_RaBd9WErikfcnn9+ud/4TwZKRu8="
const ImageKitClient = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || privateKey
})

const uploadMusic = async (file)=>{
    const result = await ImageKitClient.files.upload({
        file: file.toString("base64"),
        fileName:"music.mp3" + Date.now()
    })
    return result;
}

export  {uploadMusic};