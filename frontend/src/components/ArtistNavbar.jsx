import axios from "axios";
import React, { useEffect, useState } from "react";

const ArtistNavbar = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URI}/api/auth/verify`,
          { withCredentials: true }
        );
        setUserData(res.data.user);
      } catch (error) {
        console.log("Auth verify failed", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URI}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      window.location.href = "/api/auth/login";
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 h-1/10 bg-linear-to-r from-black via-gray-900 to-black border-b border-gray-800 shadow-lg flex items-center justify-between px-6">
      
      {/* Logo / Brand */}
      <div className="text-white font-bold text-xl tracking-wide">
        🎵 Sangeet Listener
      </div>

      {/* User Section */}
      <div className="flex items-center gap-4">
        {userData ? (
          <>
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
              {userData.username?.charAt(0).toUpperCase()}
            </div>

            {/* Username */}
            <span className="text-gray-200 font-medium">
              {userData.username}
            </span>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 transition px-4 py-1.5 rounded-lg text-white text-sm font-semibold"
            >
              Logout
            </button>
          </>
        ) : (
          <span className="text-gray-400 text-sm">Loading...</span>
        )}
      </div>
    </nav>
  );
};

export default ArtistNavbar;