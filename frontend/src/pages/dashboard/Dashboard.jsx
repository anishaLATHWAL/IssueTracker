import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { handleError } from "../../utils/utils";

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({
    city: "",
    state: "",
    category: "",
    severity: "",
  });
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await axios.get(`${API_URL}/issues`);
        setIssues(res.data.issues);
        setFiltered(res.data.issues);
      } catch {
        handleError("Failed to fetch issues");
      }
    };
    fetchIssues();
  }, [API_URL]);

  // Apply filters
  useEffect(() => {
    let data = [...issues];
    Object.entries(filters).forEach(([key, val]) => {
      if (val) data = data.filter((i) => i.location?.[key] === val || i[key] === val);
    });
    setFiltered(data);
  }, [filters, issues]);

  // Extract unique values for dropdowns
  const unique = (arr, key) => [...new Set(arr.map((i) => i.location?.[key] || i[key]))].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#181818] text-white px-6 pt-24 pb-12">
      <h1 className="text-3xl font-bold text-center text-[#b387f5] mb-8">
        Reported Issues
      </h1>

      {/* 🧭 Filter Controls */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {["city", "state", "category", "severity"].map((key) => (
          <select
            key={key}
            value={filters[key]}
            onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
            className="bg-[#1f1f1f] border border-gray-600 px-3 py-2 rounded-lg focus:border-[#b387f5]"
          >
            <option value="">{key.charAt(0).toUpperCase() + key.slice(1)}</option>
            {unique(issues, key).map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        ))}
        <button
          onClick={() =>
            setFilters({ city: "", state: "", category: "", severity: "" })
          }
          className="px-3 py-2 bg-[#b387f5] text-black rounded-lg hover:bg-[#a173e0]"
        >
          Reset
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400">No issues found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((issue) => (
            <div
              key={issue._id}
              onClick={() => navigate(`/issue/${issue._id}`)}
              className="cursor-pointer bg-[#1f1f1f] rounded-xl border border-[#b387f5]/30 shadow-md hover:shadow-[#b387f5]/40 hover:scale-[1.03] transition-all"
            >
              <img
                src={issue.imageUrl}
                alt={issue.title}
                className="w-full h-48 object-cover rounded-t-xl"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-[#b387f5] truncate">
                  {issue.title}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {issue.location?.city || "Unknown City"},{" "}
                  {issue.location?.state || "Unknown State"}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {issue.category} • {issue.severity}
                </p>
                <p
                  className={`mt-2 text-sm font-semibold ${
                    issue.status === "Done"
                      ? "text-green-500"
                      : issue.status === "Working"
                      ? "text-yellow-400"
                      : "text-gray-400"
                  }`}
                >
                  {issue.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
