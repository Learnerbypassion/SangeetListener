import React, { useEffect, useState } from "react";
import MusicCards from "../components/MusicCards.jsx";
import axios from "axios";
import ArtistNavbar from "../components/ArtistNavbar.jsx";

const ShowMusicPages = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URI}/api/music/list-musics`
        )
        .finally(()=>{
          setLoading(false);
        })
        setData(res.data.musics);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMusic();
  }, []);
   if (loading) {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-linear-to-br from-indigo-950 via-gray-900 to-black">
      <div className="flex flex-col items-center gap-6 p-10 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        
        {/* Glowing Spinner */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-40 animate-pulse"></div>
          <div className="w-14 h-14 rounded-full border-4 border-transparent border-t-indigo-400 border-r-purple-400 animate-spin"></div>
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-xl font-semibold text-white tracking-wide">
            Authenticating
          </p>

          {/* Animated dots */}
          <div className="flex justify-center gap-1 mt-2">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
        </div>

      </div>
    </div>
  );
}

  return (
    <div className=" h-screen w-full">
      <ArtistNavbar />

      <div className="mt-18 min-h-screen  bg-linear-to-br from-black via-gray-900 to-black text-white">
        
        {/* Header Section */}
        <div className="px-10 pt-8 pb-4 ">
          <h1 className="text-3xl font-bold tracking-wide">
            🎧 Music Library
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Stream and enjoy your uploaded tracks
          </p>
        </div>

        {/* Music Grid */}
        <div className="px-8 pb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
          {data.length > 0 ? (
            data.map((elem, idx) => (
              <MusicCards
                key={idx}
                title={elem.title}
                uri={elem.uri}
              />
            ))
          ) : (
            <p className="text-gray-400 col-span-full text-center mt-20">
              No music available 🎵
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowMusicPages;