import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { handleError, handleSuccess } from "../../utils/utils";

const PostIssue = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [category, setCategory] = useState("Other");
  const [severity, setSeverity] = useState("Low");

  const API_URL = import.meta.env.VITE_API_URL;
  const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // 🗺️ Get user's location + reverse geocode
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        try {
          const res = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
          );
          const result = res.data.results[0];
          const formattedAddress = result?.formatted_address || "Unknown location";
          const addressComponents = result?.address_components || [];

          const getPart = (type) =>
            addressComponents.find((c) => c.types.includes(type))?.long_name || "";

          setAddress(formattedAddress);
          setCoords((prev) => ({
            ...prev,
            city: getPart("locality"),
            state: getPart("administrative_area_level_1"),
            country: getPart("country"),
          }));
        } catch {
          handleError("Failed to fetch address");
        }
      });
    }
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !photo) {
      handleError("All fields are required!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return handleError("Unauthorized. Please log in.");

      // Upload image to Cloudinary
      const formData = new FormData();
      formData.append("file", photo);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const uploadRes = await axios.post(CLOUDINARY_URL, formData);
      const imageUrl = uploadRes.data.secure_url;

      // Prepare issue data
      const issueData = {
        title,
        description,
        imageUrl,
        category,
        severity,
        location: {
          lat: coords.lat,
          lng: coords.lng,
          address,
          city: coords.city,
          state: coords.state,
          country: coords.country,
        },
      };

      // Send to backend
      await axios.post(`${API_URL}/issues`, issueData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      handleSuccess("Issue created successfully!");
      setTimeout(() => navigate("/home"), 1200);
    } catch (err) {
      console.error(err);
      handleError(err.response?.data?.message || "Failed to create issue");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#181818] text-white pt-20">
      <div className="w-full max-w-md bg-[#1f1f1f] p-8 rounded-2xl shadow-xl border border-[#b387f5]/30">
        <h2 className="text-3xl text-center text-[#b387f5] mb-6 font-bold">
          Post a Local Issue
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Issue Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent border border-gray-500 rounded-lg px-4 py-2 focus:border-[#b387f5]"
          />

          <textarea
            placeholder="Describe the issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-transparent border border-gray-500 rounded-lg px-4 py-2 h-28 resize-none focus:border-[#b387f5]"
          />

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-transparent border border-gray-500 rounded-lg px-4 py-2 focus:border-[#b387f5]"
          >
             <option>Road</option>
            <option>Electricity</option>
            <option>Water</option>
            <option>Garbage</option>
            <option>Public Safety</option>
            <option>Other</option>
          </select>

          {/* Severity */}
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full bg-transparent border border-gray-500 rounded-lg px-4 py-2 focus:border-[#b387f5]"
          >
           <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full text-sm file:bg-[#b387f5] file:text-black file:px-3 file:py-1 file:rounded-md"
          />

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-60 rounded-lg border object-cover"
            />
          )}

          <p className="text-sm text-gray-300">
            📍 {address ? address : "Fetching location..."}
          </p>

          <button
            type="submit"
            className="w-full py-3 bg-[#b387f5] text-black rounded-lg hover:bg-[#a173e0] font-semibold"
          >
            Submit Issue
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostIssue;
