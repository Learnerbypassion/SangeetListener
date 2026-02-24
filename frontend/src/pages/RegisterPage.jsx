import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [reEnteredPassword, setReEnteredPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("User");
  const [registrationErr, setRegistrationErr] = useState(false);
  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(email, username, password, reEnteredPassword, role);
    if (password !== reEnteredPassword) {
      console.log(password.length);
      setPassword("");
      setReEnteredPassword("");
      setError("Passwords do not match ❌");
      return;
    }
    if (password.length < 6) {
      setPassword("");
      setReEnteredPassword("");
      setError("Passwords must be 6 characters ❌");
      return;
    }
    setError("");
    axios
      .post("http://localhost:3000/api/auth/register", {
        username,
        email,
        password,
        role,
      })
      .then(() => {
        alert("Register successfull");
		navigate('/api/auth/login')
        setRegistrationErr(false);
        setEmail("");
        setPassword("");
        setReEnteredPassword("");
        setRole("");
        setUsername("");
      })
      .catch((err) => {
        setRegistrationErr(true);
        console.log(err);
        if (err && err?.response.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("Re-register");
        }
		setEmail("");
        setPassword("");
        setReEnteredPassword("");
        setRole("");
        setUsername("");
      });
  };
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[url(/registerBG.jpg)] bg-cover bg-center p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-black/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
        {/* Left Section (optional branding / illustration) */}
        <div className="hidden lg:flex lg:w-1/2 items-center  justify-center p-10 text-white">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Join the SangeetListner 🎵</h1>
            <p className="text-gray-300">
              Create an account and start listening or uploading your tracks
            </p>
          </div>
        </div>
        {/* Right Section (Form) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
          <form className="w-full max-w-md space-y-5" onSubmit={submitHandler}>
            <h2 className="text-2xl font-bold text-white text-center mb-4">
              Create Account
            </h2>

            {/* Username */}
            <div>
              <label className="block mb-1 text-sm font-medium text-white">
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                className="w-full px-4 py-3 rounded-md text-sm border outline-none border-gray-300 bg-white"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 text-sm font-medium text-white">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-md text-sm border outline-none border-gray-300 bg-white"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 text-sm font-medium text-white">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-md text-sm border outline-none border-gray-300 bg-white"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>
            {!registrationErr && error && (
              <p className="text-red-400 text-sm font-medium">{error}</p>
            )}
            {/* Confirm Password */}
            <div>
              <label className="block mb-1 text-sm font-medium text-white">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 rounded-md text-sm border outline-none border-gray-300 bg-white"
                required
                value={reEnteredPassword}
                onChange={(e) => {
                  setReEnteredPassword(e.target.value);
                }}
              />
            </div>

            {/* Role */}
            <div>
              <label className="block mb-1 text-sm font-medium text-white">
                Role
              </label>
              <select
                name="role"
                className="w-full px-4 py-3 rounded-md text-sm border cursor-pointer border-gray-300 outline-none bg-white"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                }}
              >
                <option value="User">User</option>
                <option value="Artist">Artist</option>
              </select>
              {registrationErr && (
                <div className="mt-3 bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md animate-pulse flex justify-center items-center">
                  {error}
                </div>
              )}
            </div>

            <button
              className="w-full py-3 rounded-md text-white font-semibold cursor-pointer text-base transition bg-linear-to-br from-indigo-500 to-purple-600 hover:opacity-80"
              type="submit"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
