import React from "react";
import ReactAudioPlayer from "react-audio-player";

const MusicCards = (props) => {
  return (
    <div className=" flex items-center justify-center">
      <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 w-80 text-center border border-gray-700 hover:scale-105 transition-transform duration-300">
        
        {/* Album Art */}
        <div className="w-40 h-40 mx-auto mb-4 rounded-4xl overflow-hidden shadow-lg">
          <img
            src="/cardWithoutBackGround.png"  // replace with your cover image
            alt="Album Cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Song Info */}
        <h2 className="text-xl font-semibold text-white">{props.title}</h2>
        <p className="text-sm text-gray-400 mb-4">Now Playing</p>

        {/* Audio Player */}
        <ReactAudioPlayer
          src={props.uri}
          controls
          className="w-full rounded-lg"
        />
      </div>
    </div>
  );
};

export default MusicCards;