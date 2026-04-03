import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleError, handleSuccess } from "../../../utils/utils";
import axios from "axios";
import "./login.css";

const Login = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;

    if (!email || !password)
      return handleError("Email and password are required");

    try {
      const { data } = await axios.post(`${API_URL}/user/login`, loginInfo);

      if (data.success) {
        const { message, jwtToken, user } = data;
        handleSuccess(message);

        // 🧠 Save token and user
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect based on role
        setTimeout(() => {
          if (user.role === "admin") navigate("/admin/dashboard");
          else navigate("/home");
        }, 1000);
      } else {
        handleError(data.message || "Login failed");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      handleError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#181818] text-white px-4 pt-20">
      <div className="w-full max-w-md bg-[#1f1f1f] rounded-2xl shadow-xl border border-[#b387f5]/30 p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#b387f5]">
          Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm mb-2">
              Email
            </label>
            <input
              onChange={handleChange}
              type="email"
              name="email"
              placeholder="Enter your email"
              value={loginInfo.email}
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
              value={loginInfo.password}
              className="bubble-input w-full bg-transparent border border-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:border-[#b387f5]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#b387f5] text-black font-semibold hover:bg-[#a173e0] transition-all shadow-md"
          >
            Login
          </button>

          <p className="text-sm text-center text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#b387f5] font-medium hover:underline"
            >
              Signup
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
