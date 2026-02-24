import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Login = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("")
  const navigate = useNavigate();
  const submitHandler = async (e) => {
    e.preventDefault();
    console.log("Form is submitted");
    axios
      .post(
        "http://localhost:3000/api/auth/login",
        { username, email, password },
        { withCredentials: true },
      )
      .then((res) => {
        alert("Login Page");
		setRole(res.data.role)
		if(res.data.role === 'Artist'){
			navigate("/api/music/upload-music");
			console.log(role);
			
		}else{
			console.log(role);
      navigate("/api/music/list-musics");
			setError("")
		}
        setEmail("");
        setPassword("");
      })
      .catch((err) => {
        if (err && err?.response.data?.message) {
          setError(err.response.data.message);
        }else{
          setError("Wrong Password or Email")
        }
      });
  };

  const pageNavigator = async () => {
    console.log("Hello Guyss");
    navigate("/api/auth/register");
  };

  return (
    <div className="relative w-full min-h-screen flex justify-center items-center overflow-hidden px-4">
      {/* Blurred Background */}
      <div className="absolute inset-0 bg-[url('https://i.pinimg.com/1200x/3e/9f/58/3e9f58e6ed92ab176746d36e37b3547c.jpg')] bg-cover bg-center blur-sm scale-110"></div>

      {/* Foreground */}
      <div className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <div className="flex flex-col w-full rounded-3xl backdrop-blur-md border border-gray-800 shadow-2xl justify-evenly items-center p-6 sm:p-8">
          <h1 className="font-bold text-3xl sm:text-4xl text-amber-200 mb-4">
            Log<span className="underline">In</span>
          </h1>

          <form
            id="loginForm"
            onSubmit={submitHandler}
            className="flex flex-col w-full gap-3"
          >
            {error && (
              <p className="text-red-400 text-center animate-pulse">{error}</p>
            )}
            <input
              required
              className="border-b-2 p-2 text-lg sm:text-xl outline-none w-full text-amber-100 border-amber-300 bg-transparent"
              placeholder="Email/Username"
              value={email}
              onChange={(e) => {
				setEmail(e.target.value);
				setUsername(e.target.value);
			}}
            />

            <input
              required
              className="border-b-2 p-2 text-lg sm:text-xl outline-none w-full text-amber-100 border-amber-300 bg-transparent"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="hover:bg-gray-600 duration-300 p-2 rounded-xl text-lg sm:text-xl mt-2 bg-transparent shadow-sm cursor-pointer">
              <span className="font-medium text-amber-400">Login</span>
            </button>
          </form>

          <span className="text-gray-400 text-sm flex flex-wrap gap-x-2 items-center justify-center mt-3 text-center">
            Didn&apos;t have an account?
            <button
              className="hover:text-blue-500 cursor-pointer"
              onClick={pageNavigator}
            >
              Click here!
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
