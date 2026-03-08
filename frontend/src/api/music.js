import api from "./axiosInstance";

export const uploadMusic = ({ title, file, coverImage, genre, mood, description, visibility }, onUploadProgress) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("music", file);
    if (coverImage) formData.append("image", coverImage);
    if (genre) formData.append("genre", genre);
    if (mood) formData.append("mood", mood);
    if (description) formData.append("description", description);
    if (visibility) formData.append("visibility", visibility);

    return api.post("/api/music/upload-music", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
    });
};

export const listMusic = () =>
    api.get("/api/music/list-musics");

/**
 * Get the stream URL for a song.
 * The backend stores the full Cloudinary/ImageKit URL in `uri`.
 */
export const getStreamUrl = (song) => {
    return song?.uri || "";
};
