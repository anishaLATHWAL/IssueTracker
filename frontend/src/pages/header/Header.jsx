import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, Shield } from "lucide-react"; // 👈 Added Shield icon for admin
import "./Header.css";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const navLinks = [
  { name: "Home", path: "/home" },
  { name: "Post", path: "/post" },
];

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === "admin") {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, [token]);

  const handleLogin = () => navigate("/login");
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="fixed top-0 left-0 bg-[#1f1f1f] h-16 w-full flex items-center px-6 md:px-10 text-white shadow-lg z-50">
      {/* ===== Mobile Layout ===== */}
      <div className="flex w-full items-center justify-between md:hidden relative">
        <button
          className="flex items-center justify-center text-white z-20"
          onClick={toggleMenu}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        <div
          className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <h1 className="text-lg font-semibold tracking-wide text-white transition-colors duration-300 hover:text-[#B387F5]">
            Issue Tracker
          </h1>
        </div>
      </div>

      {/* ===== Desktop Layout ===== */}
      <div className="hidden md:flex w-full items-center justify-between">
        {/* Left: Logo */}
        <div
          className="shrink-0 relative group cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <h1 className="text-xl md:text-2xl font-semibold tracking-wide text-white transition-colors duration-300 group-hover:text-[#B387F5]">
            Issue Tracker
          </h1>
          <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#B387F5] transition-all duration-500 group-hover:w-full" />
        </div>

        {/* Right: Nav + Buttons */}
        <nav className="flex gap-4 md:gap-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="relative inline-flex items-center px-3 py-1 group overflow-hidden rounded-lg"
            >
              <span
                aria-hidden
                className="absolute inset-0 bg-[#B387F5]/20 rounded-lg transform scale-95 group-hover:scale-105 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out"
              />
              <span className="relative z-10 text-sm md:text-base transition-colors duration-200 group-hover:text-[#B387F5]">
                {link.name}
              </span>
            </Link>
          ))}

          {isAdmin && (
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="ml-2 inline-flex items-center px-4 py-2 rounded-md bg-[#FFD700] text-black font-semibold hover:bg-[#e6c200] transition"
            >
              <Shield size={18} className="mr-2" /> Admin Panel
            </button>
          )}

          {token ? (
            <button
              onClick={() => navigate("/profile")}
              className="ml-2 inline-flex items-center px-4 py-2 rounded-md bg-[#B387F5] text-black font-semibold hover:bg-[#a173e0] transition"
            >
              <User size={18} className="mr-2" /> Profile
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="ml-2 inline-flex items-center px-4 py-2 rounded-md bg-[#B387F5] text-black font-semibold hover:bg-[#a173e0] transition"
            >
              Login
            </button>
          )}
        </nav>
      </div>

      {/* ===== Mobile Dropdown ===== */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-[#1f1f1f] flex flex-col items-center gap-4 py-6 border-t border-gray-700 md:hidden animate-slide-down">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className="text-lg text-white hover:text-[#B387F5] transition"
            >
              {link.name}
            </Link>
          ))}

          {isAdmin && (
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/admin/dashboard");
              }}
              className="inline-flex items-center px-5 py-2 rounded-md bg-[#FFD700] text-black font-semibold hover:bg-[#e6c200] transition"
            >
              <Shield size={18} className="mr-2" /> Admin Panel
            </button>
          )}

          {token ? (
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/profile");
              }}
              className="inline-flex items-center px-5 py-2 rounded-md bg-[#B387F5] text-black font-semibold hover:bg-[#a173e0] transition"
            >
              <User size={18} className="mr-2" /> Profile
            </button>
          ) : (
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogin();
              }}
              className="inline-flex items-center px-5 py-2 rounded-md bg-[#B387F5] text-black font-semibold hover:bg-[#a173e0] transition"
            >
              Login
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
