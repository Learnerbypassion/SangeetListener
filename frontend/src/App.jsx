import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LandingPage from "./pages/LandingPage";
import ShowMusicPages from "./pages/ShowMusicPages";
import ArtistPage from "./pages/ArtistPage";
import ProtectedRoute from "./components/ProtectedRoutes";
import OtpVerificationPage from "./pages/OtpVerificationPage";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OtpVerificationPage />} />
        <Route
          path="/list-musics"
          element={
            <ProtectedRoute roleArtist="Artist" roleUser="User">
              <ShowMusicPages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-music"
          element={
            <ProtectedRoute roleArtist="Artist">
              <ArtistPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
