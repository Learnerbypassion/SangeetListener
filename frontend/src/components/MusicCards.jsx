import React from "react";
import ReactAudioPlayer from "react-audio-player";

const MusicCards = ({
  title,
  uri,
  artist ,
  isPlaying = false,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-center group">
      <div className="relative w-80">
        <div
          className="absolute -inset-1 rounded-2xl bg-linear-to-r 
                        from-fuchsia-300 via-teal-400 to-lime-200 
                        opacity-0 group-hover:opacity-100 
                        blur-md transition duration-300"
        ></div>

        {/* 🎵 Card */}
        <div
          className={`relative bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 text-center border border-gray-700 transition-all duration-300 hover:scale-105 ${
            isPlaying ? "ring-2 ring-green-500" : ""
          }`}
        >
          {/* Album Art */}
          <div className="w-40 h-40 mx-auto mb-4 rounded-3xl overflow-hidden shadow-lg">
            <img
              src="/cardWithoutBackGround.png"
              alt="Album Cover"
              onError={(e) =>
                (e.target.src =
                  "https://cdn-icons-png.flaticon.com/512/727/727245.png")
              }
              className="w-full h-full object-cover"
            />
          </div>

          {/* Song Info */}
          <h2 className="text-xl font-semibold text-white truncate">{title}</h2>
          <p className="text-sm text-gray-400 mb-3">{artist}</p>

          {/* Audio Player */}
          <ReactAudioPlayer
            src={uri}
            controls
            className="w-full rounded-lg mb-4"
            onPlay={(e) => {
              const audios = document.querySelectorAll("audio");
              audios.forEach((audio) => {
                if (audio !== e.target) {
                  audio.pause();
                }
              });
            }}
          />

          {/* Actions */}
          {(onEdit || onDelete) && (
            <div className="flex justify-between gap-3">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-1.5 rounded-lg"
                >
                  Edit
                </button>
              )}

              {onDelete && (
                <button
                  onClick={onDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 rounded-lg"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicCards;
