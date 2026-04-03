import React, { useEffect, useState } from "react";
import axios from "axios";
import { handleError, handleSuccess } from "../../utils/utils";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
        setIssues(res.data.user.issuesReported || []);
      } catch (error) {
        handleError(error.response?.data?.message || "Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    handleSuccess("Logged out successfully! 👋");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axios.delete(`${API_URL}/issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleSuccess("Issue deleted!");
      setIssues(issues.filter((i) => i._id !== id));
    } catch {
      handleError("Failed to delete issue");
    }
  };

  if (!user) return <p className="text-center mt-20 text-white">Loading...</p>;

  return (
    <div className="pt-20 px-6 text-white">
      <h2 className="text-2xl font-semibold mb-4">👤 Profile</h2>
      <div className="bg-[#2b2b2b] p-4 rounded-lg mb-8 flex items-center gap-4">
  <img
    src={user.profilePic || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
    alt="Profile"
    className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
  />
  <div>
    <p><strong>Name:</strong> {user.name}</p>
    <p><strong>Email:</strong> {user.email}</p>
    <button
      onClick={handleLogout}
      className="mt-4 px-4 py-2 bg-red-500 rounded-md hover:bg-red-600"
    >
      Logout
    </button>
  </div>
</div>

      <h3 className="text-xl font-semibold mb-3">📋 My Posts</h3>
      <div className="grid gap-4">
        {issues.map((issue) => (
          <div
            key={issue._id}
            className="bg-[#1f1f1f] p-4 rounded-lg border border-gray-700"
          >
            <h4 className="font-semibold text-[#B387F5]">{issue.title}</h4>
            <p className="text-sm mt-1">{issue.description}</p>
            <p className="text-xs text-gray-400 mt-2">
              Status: {issue.status}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => (window.location.href = `/issue/${issue._id}`)}
                className="px-3 py-1 bg-blue-500 rounded hover:bg-blue-600 text-sm"
              >
                View
              </button>
              <button
                onClick={() => handleDelete(issue._id)}
                className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
