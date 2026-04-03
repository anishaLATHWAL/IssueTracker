import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { handleError, handleSuccess } from "../../utils/utils";
import { jwtDecode } from "jwt-decode";

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0 });
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [userRole, setUserRole] = useState("");

  // 🧩 Decode role from JWT stored in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role || "user");
      } catch {
        console.error("Invalid token");
      }
    }
  }, []);

  // 🧩 Fetch issue details
  const fetchIssue = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIssue(res.data.issue);
      setStatus(res.data.issue.status || "Pending");
      setVotes({
        upvotes: res.data.issue.upvotes?.length || 0,
        downvotes: res.data.issue.downvotes?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching issue:", error);
      handleError("Failed to load issue details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [id]);

  // 🧩 Handle votes
  const handleVote = async (type) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `${API_URL}/issues/${id}/${type}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVotes({ upvotes: res.data.upvotes, downvotes: res.data.downvotes });
      handleSuccess("Vote updated!");
    } catch {
      handleError("Error updating vote");
    }
  };

  // 🧩 Add comment
  const handleAddComment = async () => {
    if (!comment.trim()) return handleError("Comment cannot be empty");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/issues/${id}/comment`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleSuccess("Comment added!");
      setComment("");
      setIssue((prev) => ({
        ...prev,
        comments: res.data.comments,
      }));
    } catch {
      handleError("Failed to add comment");
    }
  };

  // 🧩 Admin can update status
  const handleStatusUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/issues/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleSuccess("Status updated!");
      fetchIssue();
    } catch {
      handleError("Failed to update status");
    }
  };

  if (loading)
    return <div className="text-center text-gray-400 mt-20">Loading...</div>;

  if (!issue)
    return <div className="text-center text-red-400 mt-20">Issue not found.</div>;

  // 🧩 Separate comments
  const adminComments = issue.comments?.filter(
    (c) => c.user?.role === "admin"
  ) || [];
  const userComments = issue.comments?.filter(
    (c) => c.user?.role !== "admin"
  ) || [];

  return (
    <div className="min-h-screen bg-[#181818] text-white px-4 pt-24 pb-16">
      <button
        onClick={() => navigate("/home")}
        className="text-[#b387f5] underline mb-6 hover:text-[#a173e0]"
      >
        ← Back to Issues
      </button>

      <div className="max-w-4xl mx-auto bg-[#1f1f1f] p-8 rounded-3xl border border-[#b387f5]/30 shadow-xl">
        <h1 className="text-4xl font-bold text-[#b387f5] mb-3">{issue.title}</h1>
        <p className="text-gray-400 mb-2">
          Posted by <span className="text-[#b387f5]">{issue.user?.name}</span> •{" "}
          {new Date(issue.createdAt).toLocaleDateString()}
        </p>

        {/* 🟢 Status */}
        <p className="text-gray-400 mb-2">
          <span className="text-[#b387f5] font-semibold">Status:</span>{" "}
          <span
            className={`${
              status === "Done"
                ? "text-green-400"
                : status === "Working"
                ? "text-yellow-400"
                : "text-red-400"
            } font-semibold`}
          >
            {status}
          </span>{" "}
          {status === "Done" && issue.resolvedAt && (
      <span>
       •{" "}{new Date(issue.resolvedAt).toLocaleDateString()}
      </span>
    )}
        </p>

        {/* 🧩 Admin-only status update */}
        {userRole === "admin" && (
          <div className="flex gap-3 items-center mb-4">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-transparent border border-[#b387f5]/50 text-white rounded-lg px-4 py-2"
            >
              <option value="Pending">Pending</option>
              <option value="Working">Working</option>
              <option value="Done">Done</option>
            </select>

            <button
              onClick={handleStatusUpdate}
              className="px-4 py-2 bg-[#b387f5] text-black rounded-lg hover:bg-[#a173e0]"
            >
              Update Status
            </button>
          </div>
        )}

        <p className="text-gray-400 mb-2">
          <span className="text-[#b387f5] font-semibold">Category:</span>{" "}
          {issue.category || "N/A"}
        </p>
        <p className="text-gray-400 mb-4">
          <span className="text-[#b387f5] font-semibold">Severity:</span>{" "}
          {issue.severity || "N/A"}
        </p>

        {/* 🖼️ Image */}
        <img
          src={issue.imageUrl}
          alt={issue.title}
          className="w-full h-[350px] rounded-xl mb-6 border border-[#b387f5]/20 object-cover"
        />
        <p className="text-gray-200 mb-8">{issue.description}</p>

        {/* 🗺️ Map */}
        {issue.location?.lat && (
          <div className="rounded-lg overflow-hidden border border-[#b387f5]/30 mb-8">
            <iframe
              width="100%"
              height="320"
              loading="lazy"
              style={{ border: 0 }}
              src={`https://www.google.com/maps/embed/v1/place?key=${
                import.meta.env.VITE_GOOGLE_MAPS_API_KEY
              }&q=${issue.location.lat},${issue.location.lng}`}
            ></iframe>
          </div>
        )}

        {/* 👍👎 Votes */}
        <div className="flex justify-center gap-6 mb-8">
          <button
            onClick={() => handleVote("upvote")}
            className="bg-green-600 px-6 py-2 rounded-full font-semibold"
          >
            👍 {votes.upvotes}
          </button>
          <button
            onClick={() => handleVote("downvote")}
            className="bg-red-600 px-6 py-2 rounded-full font-semibold"
          >
            👎 {votes.downvotes}
          </button>
        </div>

        {/* 💬 Comments */}
        <div className="border-t border-[#b387f5]/20 pt-6">
          <h2 className="text-2xl font-semibold text-[#b387f5] mb-4">
            Comments
          </h2>

          {/* Add comment */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="grow px-4 py-2 bg-transparent border border-gray-600 rounded-lg focus:border-[#b387f5]"
            />
            <button
              onClick={handleAddComment}
              className="px-4 py-2 bg-[#b387f5] text-black rounded-lg hover:bg-[#a173e0]"
            >
              Post
            </button>
          </div>

          {/* 🧾 Scrollable Comments */}
          <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {[...adminComments, ...userComments].map((c, i) => (
              <div
                key={i}
                className={`border border-gray-800 py-3 px-4 mb-3 rounded-xl ${
                  c.user?.role === "admin"
                    ? "bg-[#1f1f1f]"
                    : "bg-[#1f1f1f]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-semibold ${
                      c.user?.role === "admin" ? "text-green-400" : "text-[#b387f5]"
                    }`}
                  >
                    {c.user?.name || "Anonymous"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* {c.user?.role === "admin" && (
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-md font-medium">
                    Admin
                  </span>
                )} */}

                <p className="text-gray-300 text-sm leading-relaxed mt-1">
                  {c.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetails;
