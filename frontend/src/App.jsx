import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LandingPage from "./pages/LandingPage";
import ShowMusicPages from "./pages/ShowMusicPages";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element= { <LandingPage/>}/>
        <Route path="/api/auth/login" element= { <Login/>}/>
        <Route path="/api/auth/register" element= { <RegisterPage/> }/>
        <Route path="/api/music/upload-music" element= { <ShowMusicPages/> }/>

      </Routes>
    </Router>
  );
};

export default App;
