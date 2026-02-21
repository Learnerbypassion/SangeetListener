import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "User",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async () => {
    console.log("Hello");
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-500 to-purple-600 p-5 font-sans">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Create Account
        </h1>
        <p className="text-sm text-gray-500 mb-8">Join us today</p>

        <form className="space-y-5">
          {/* Username */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className="w-full px-3 py-3 rounded-md text-sm border outline-none border-gray-300 bg-white"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-3 py-3 rounded-md text-sm border outline-none border-gray-300 bg-white"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              className="w-full px-3 py-3 rounded-md text-sm border outline-none border-gray-300 bg-white"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className="w-full px-3 py-3 rounded-md text-sm border outline-none border-gray-300 bg-white"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-3 rounded-md text-sm border cursor-pointer border-gray-300 outline-none bg-white"
            >
              <option value="User">User</option>
              <option value="Admin">Artist</option>
            </select>
          </div>

          <button
            type="button"
            className="w-full py-3 rounded-md text-white font-semibold cursor-pointer text-base transition bg-linear-to-br from-indigo-500 to-purple-600 hover:opacity-90"
            onClick={handleSubmit}
          >
            Register
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{" "}
          <a
            href="/api/auth/login"
            className="text-indigo-500 font-medium hover:underline"
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
