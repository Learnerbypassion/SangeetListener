import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children, role }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URI}/api/auth/verify`,
          { withCredentials: true }
        );

        // if role required (Artist page)
       if (roleArtist && res.data.user.role === roleArtist) {
          setAuthorized(true);
        } else if (roleUser && res.data.user.role === roleUser) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      } catch (err) {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [roleArtist, roleUser]);

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

  return authorized ? children : <Navigate to="/api/auth/login" />;
};

export default ProtectedRoute;