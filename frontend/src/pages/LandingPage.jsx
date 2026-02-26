import React from "react";
import { useNavigate } from "react-router-dom";
const LandingPage = () => {
  const navigate = useNavigate()
  return (
    <div className="relative w-full h-screen overflow-hidden flex justify-center items-center flex-col">
      <video
        autoPlay
        muted
        loop
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/LandingBG.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 z-10 flex items-center justify-center text-center px-4 ">
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-wide text-white drop-shadow-xl">
          <span className="block uppercase hover:scale-105 transition-transform duration-100 ">
            Be Rocking
          </span>
          <span className="block text-3xl md:text-5xl my-2 font-light font-[Playfair_Display] hover:scale-105 transition-transform duration-100">
            &
          </span>
          <span className="block uppercase hover:scale-105 transition-transform duration-100">
            Feel the Rhythm of
          </span>
          <span className="block mt-3 bg-linear-to-r from-pink-300 via-fuchsia-300 to-purple-800 bg-clip-text text-transparent font-[Playfair_Display] text-6xl md:text-8xl font-black tracking-widest">
            LIFE
          </span>
        </h1>
      </div>
      <button
      className="relative border-2 border-white border-double rounded-4xl mt-5 bg-transparent p-2 px-4 text-white z-20 text-2xl cursor-pointer translate-y-50 hover:scale-105 transition-transform duration-100"
      onClick={()=>{
        navigate("/api/auth/login");
      }}
      ><span className="font-[Playfair_Display] font-bold">Sign Up</span></button>
    </div>
  );
};

export default LandingPage;
