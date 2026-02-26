import React, { useState } from "react";
import axios from "axios";
import ArtistNavbar from "../components/ArtistNavbar";
import { useNavigate } from "react-router-dom";

const ArtistPage = () => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const handleFileChange = (e) => {
    const audio = e.target.files[0];
    setFile(audio);

    if (audio) {
      setPreview(URL.createObjectURL(audio)); // audio preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !file) {
      return setMessage("Please provide title and music file 🎵");
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("music", file); // multer field name must be "music"

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URI}/api/music/upload-music`,
        formData,
        {
          withCredentials: true, // VERY IMPORTANT (cookie JWT)
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setMessage("🎉 Music uploaded successfully!");
      setTitle("");
      setFile(null);
      setPreview("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen">
      <ArtistNavbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-black via-gray-900 to-black ">
        <div className="bg-gray-800/60 backdrop-blur-lg shadow-xl rounded-2xl p-8 w-105 border border-gray-700">
          <h2 className="text-2xl font-bold text-center text-white mb-6">
            🎵 Upload New Music
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="text-sm text-gray-300">Music Title</label>
              <input
                type="text"
                className="w-full mt-1 p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter song title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="text-sm text-gray-300">Upload Audio</label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="w-full mt-2 text-gray-300 file:bg-green-600 file:text-white file:px-4 file:py-2 file:rounded-lg file:border-none cursor-pointer"
              />
            </div>

            {/* Audio Preview */}
            {preview && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-1">Preview:</p>
                <audio controls src={preview} className="w-full" />
              </div>
            )}

            {/* Submit */}
            <button
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 transition p-3 rounded-xl text-white font-semibold"
            >
              {loading ? "Uploading..." : "Upload Music"}
            </button>

            {/* Message */}
            {message && (
              <p className="text-center text-sm text-yellow-400">{message}</p>
            )}
          </form>
        </div>
        <button
          type="button"
          onClick={() => {
            navigate("/api/music/list-musics");
          }}
          className="text-lg font-semibold text-white px-5 mt-5 py-3 rounded-full
              bg-black border border-cyan-400
              shadow-[0_0_15px_#22d3ee]
              hover:shadow-[0_0_25px_#22d3ee]
              hover:scale-105 transition-all duration-300 cursor-pointer"
        >
          <span
            className="relative font-bold tracking-widest text-transparent bg-clip-text
                    bg-linear-to-r from-teal-300 via-cyan-400 to-teal-300
                    animate-[shine_3s_linear_infinite]
                    drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]"
          >
            Sangeets🎶
          </span>
        </button>
      </div>
    </div>
  );
};

export default ArtistPage;
