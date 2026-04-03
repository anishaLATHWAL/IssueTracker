import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleError, handleSuccess } from "../../../utils/utils";
import axios from "axios";
import "./signup.css";

const Signup = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [signupInfo, setSignupInfo] = useState({
    name: "",
    email: "",
    password: "",
    profilePic: "",
  });

  const [preview, setPreview] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profilePic" && files?.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignupInfo((prev) => ({ ...prev, profilePic: reader.result }));
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSignupInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password } = signupInfo;

    if (!name || !email || !password)
      return handleError("Name, email, and password are required");

    try {
      const { data } = await axios.post(`${API_URL}/user/signup`, signupInfo);

      if (data.success) {
        handleSuccess(data.message);
        setTimeout(() => navigate("/login"), 1000);
      } else {
        handleError(data.message || "Signup failed");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Signup failed";
      handleError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#181818] text-white px-4 pt-20">
      <div className="w-full max-w-md bg-[#1f1f1f] rounded-2xl shadow-xl border border-[#b387f5]/30 p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#b387f5]">
          Signup
        </h1>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm mb-2">
              Name
            </label>
            <input
              onChange={handleChange}
              type="text"
              name="name"
              placeholder="Enter your name"
              value={signupInfo.name}
              className="bubble-input w-full bg-transparent border border-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:border-[#b387f5]"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm mb-2">
              Email
            </label>
            <input
              onChange={handleChange}
              type="email"
              name="email"
              placeholder="Enter your email"
              value={signupInfo.email}
              className="bubble-input w-full bg-transparent border border-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:border-[#b387f5]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-2">
              Password
            </label>
            <input
              onChange={handleChange}
              type="password"
              name="password"
              placeholder="Enter your password"
              value={signupInfo.password}
              className="bubble-input w-full bg-transparent border border-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:border-[#b387f5]"
            />
          </div>

          {/* Optional Profile Picture */}
          <div>
            <label htmlFor="profilePic" className="block text-sm mb-2">
              Profile Picture (optional)
            </label>
            <input
              onChange={handleChange}
              type="file"
              name="profilePic"
              accept="image/*"
              className="w-full bg-transparent border border-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:border-[#b387f5]"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-3 w-20 h-20 object-cover rounded-full border border-gray-500"
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#b387f5] text-black font-semibold hover:bg-[#a173e0] transition-all shadow-md"
          >
            Signup
          </button>

          <p className="text-sm text-center text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#b387f5] font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
