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
        if (role && res.data.user.role !== role) {
          setAuthorized(false);
        } else {
          setAuthorized(true);
        }
      } catch (err) {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [role]);

  if (loading) {
    return (
      <div className="loader-container w-full flex-col h-screen flex justify-center items-center">
        <div className="spinner animate-spin text-4xl w-8 h-8 border-2 border-dotted rounded-full"></div>
        <p>Authenticating...</p>
      </div>
    );
  }

  return authorized ? children : <Navigate to="/api/auth/login" />;
};

export default ProtectedRoute;