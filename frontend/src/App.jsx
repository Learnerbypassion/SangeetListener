import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LandingPage from "./pages/LandingPage";
import ShowMusicPages from "./pages/ShowMusicPages";
import ArtistPage from "./pages/ArtistPage";
import ProtectedRoute from "./components/ProtectedRoutes";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/api/auth/login" element={<Login />} />
        <Route path="/api/auth/register" element={<RegisterPage />} />
        <Route
          path="/api/music/list-musics"
          element={
            <ProtectedRoute role="User">
              <ShowMusicPages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/api/music/upload-music"
          element={
            <ProtectedRoute role="Artist">
              <ArtistPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
