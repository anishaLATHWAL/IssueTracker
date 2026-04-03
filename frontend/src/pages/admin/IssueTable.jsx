import React, { useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const IssuesTable = ({ issues, refresh }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    category: "",
    status: "",
    city: "",
    state: "",
    severity: "",
    sort: "",
  });

  // ✅ Extract unique city/state options from issue data
  const uniqueCities = [...new Set(issues.map((i) => i.location?.city).filter(Boolean))];
  const uniqueStates = [...new Set(issues.map((i) => i.location?.state).filter(Boolean))];

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this issue?")) return;
    try {
      await axios.delete(`${API_URL}/admin/issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refresh();
    } catch (error) {
      console.error("Error deleting issue:", error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(
        `${API_URL}/issues/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refresh();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // ✅ Filter & sort logic
  const filteredIssues = useMemo(() => {
    let data = [...issues];

    if (filters.category)
      data = data.filter((i) => i.category === filters.category);
    if (filters.status) data = data.filter((i) => i.status === filters.status);
    if (filters.city)
      data = data.filter((i) => i.location?.city === filters.city);
    if (filters.state)
      data = data.filter((i) => i.location?.state === filters.state);
    if (filters.severity)
      data = data.filter((i) => i.severity === filters.severity);

    // Sort by severity
    if (filters.sort) {
      const severityOrder = ["Low", "Medium", "High", "Critical"];
      data.sort((a, b) => {
        const diff =
          severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
        return filters.sort === "high" ? -diff : diff;
      });
    }

    return data;
  }, [issues, filters]);

  return (
    <div className="overflow-x-auto">
      <h3 className="text-xl font-semibold text-[#b387f5] mb-4">Issues</h3>

      {/* 🔍 Filter Controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Category, Status, Severity dropdowns */}
        {["category", "status", "severity"].map((key) => (
          <select
            key={key}
            className="bg-[#1f1f1f] text-gray-300 px-3 py-2 rounded-lg border border-[#b387f5]/30"
            value={filters[key]}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, [key]: e.target.value }))
            }
          >
            <option value="">{key.charAt(0).toUpperCase() + key.slice(1)}</option>
            {key === "category" &&
              ["Road", "Electricity", "Water", "Garbage", "Public Safety", "Other"].map(
                (c) => <option key={c}>{c}</option>
              )}
            {key === "status" &&
              ["Pending", "Working", "Done"].map((s) => <option key={s}>{s}</option>)}
            {key === "severity" &&
              ["Low", "Medium", "High", "Critical"].map((s) => <option key={s}>{s}</option>)}
          </select>
        ))}

        {/* City dropdown */}
        <select
          className="bg-[#1f1f1f] text-gray-300 px-3 py-2 rounded-lg border border-[#b387f5]/30"
          value={filters.city}
          onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
        >
          <option value="">City</option>
          {uniqueCities.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>

        {/* State dropdown */}
        <select
          className="bg-[#1f1f1f] text-gray-300 px-3 py-2 rounded-lg border border-[#b387f5]/30"
          value={filters.state}
          onChange={(e) => setFilters((prev) => ({ ...prev, state: e.target.value }))}
        >
          <option value="">State</option>
          {uniqueStates.map((state) => (
            <option key={state}>{state}</option>
          ))}
        </select>

        {/* Sort by Severity */}
        <select
          className="bg-[#1f1f1f] text-gray-300 px-3 py-2 rounded-lg border border-[#b387f5]/30"
          value={filters.sort}
          onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
        >
          <option value="">Sort by Severity</option>
          <option value="high">High → Low</option>
          <option value="low">Low → High</option>
        </select>
      </div>

      {/* 🧾 Table */}
      <table className="min-w-full text-sm text-left border border-[#b387f5]/30 rounded-xl overflow-hidden">
        <thead className="bg-[#1f1f1f] text-[#b387f5] uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Severity</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Created By</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => (
              <tr
                key={issue._id}
                className="border-t border-[#b387f5]/20 hover:bg-[#2a2a2a] transition-all"
              >
                {/* ✅ Clickable Title */}
                <td
                  onClick={() => navigate(`/issue/${issue._id}`)}
                  className="px-4 py-3 font-medium text-[#b387f5] cursor-pointer hover:underline"
                >
                  {issue.title}
                </td>

                {/* Editable Status */}
                <td className="px-4 py-3">
                  <select
                    value={issue.status}
                    onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                    className="bg-[#1f1f1f] border border-[#b387f5]/30 rounded-lg px-2 py-1 text-gray-300 text-xs"
                  >
                    <option>Pending</option>
                    <option>Working</option>
                    <option>Done</option>
                  </select>
                </td>

                <td className="px-4 py-3 text-gray-300">{issue.severity}</td>
                <td className="px-4 py-3 text-gray-300">{issue.category}</td>

                <td className="px-4 py-3 text-gray-400">
                  {issue.location ? (
                    <>
                      <div>{issue.location.address}</div>
                      <div className="text-xs text-gray-500">
                        {issue.location.city}, {issue.location.state}
                      </div>
                    </>
                  ) : (
                    "N/A"
                  )}
                </td>

                <td className="px-4 py-3 text-gray-300">
                  {issue.user?.name || "Unknown"}
                </td>

                <td className="px-4 py-3 text-gray-400">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </td>

                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDelete(issue._id)}
                    className="text-red-400 hover:text-red-500 transition-all"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="8"
                className="px-4 py-6 text-center text-gray-500 italic"
              >
                No issues found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default IssuesTable;
