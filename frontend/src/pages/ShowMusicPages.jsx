import React, { useEffect, useState } from "react";
import MusicCards from "../components/MusicCards.jsx";
import axios from "axios";
import ArtistNavbar from "../components/ArtistNavbar.jsx";

const ShowMusicPages = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/music/list-musics"
        );
        setData(res.data.musics);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMusic();
  }, []);

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