import React, { useEffect, useState } from "react";
import axios from "axios";
import UsersTable from "./UsersTable";
import IssuesTable from "./IssueTable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIssues: 0,
    pending: 0,
    working: 0,
    done: 0,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all data
  const fetchData = async () => {
    try {
      const [userRes, issueRes] = await Promise.all([
        axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/issues`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUsers(userRes.data.users);
      setIssues(issueRes.data.issues);

      const pending = issueRes.data.issues.filter((i) => i.status === "Pending").length;
      const working = issueRes.data.issues.filter((i) => i.status === "Working").length;
      const done = issueRes.data.issues.filter((i) => i.status === "Done").length;

      setStats({
        totalUsers: userRes.data.users.length,
        totalIssues: issueRes.data.issues.length,
        pending,
        working,
        done,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  const COLORS = ["#FFBB28", "#00C49F", "#FF8042"];
  const pieData = [
    { name: "Pending", value: stats.pending },
    { name: "Working", value: stats.working },
    { name: "Done", value: stats.done },
  ];

  return (
    <div className="min-h-screen bg-[#181818] text-white px-6 pt-24 pb-12">
      <h1 className="text-3xl font-bold text-center text-[#b387f5] mb-10">
        🧭 Admin Dashboard
      </h1>

      {/* 🧮 Summary Cards */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
        <div className="bg-[#1f1f1f] rounded-xl border border-[#b387f5]/30 shadow-md text-center p-4">
          👤 <p className="text-[#b387f5] text-lg font-semibold">Users</p>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-[#1f1f1f] rounded-xl border border-[#b387f5]/30 shadow-md text-center p-4">
          📋 <p className="text-[#b387f5] text-lg font-semibold">Issues</p>
          <p className="text-2xl font-bold">{stats.totalIssues}</p>
        </div>
        <div className="bg-[#1f1f1f] rounded-xl border border-[#b387f5]/30 shadow-md text-center p-4">
          ⏳ <p className="text-[#b387f5] text-lg font-semibold">Pending</p>
          <p className="text-2xl font-bold text-gray-300">{stats.pending}</p>
        </div>
        <div className="bg-[#1f1f1f] rounded-xl border border-[#b387f5]/30 shadow-md text-center p-4">
          ⚙️ <p className="text-[#b387f5] text-lg font-semibold">Working</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.working}</p>
        </div>
        <div className="bg-[#1f1f1f] rounded-xl border border-[#b387f5]/30 shadow-md text-center p-4">
          ✅ <p className="text-[#b387f5] text-lg font-semibold">Done</p>
          <p className="text-2xl font-bold text-green-500">{stats.done}</p>
        </div>
      </div>

      {/* 📊 Charts Section */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-[#1f1f1f] rounded-xl border border-[#b387f5]/30 p-6">
          <h3 className="text-lg font-semibold mb-4 text-[#b387f5]">
            Issue Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                fill="#8884d8"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1f1f1f] rounded-xl border border-[#b387f5]/30 p-6">
          <h3 className="text-lg font-semibold mb-4 text-[#b387f5]">
            Issue Status Trends
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pieData}>
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Bar dataKey="value" fill="#b387f5" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🔁 Tabs Section */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-4 py-2 rounded-lg border ${
            activeTab === "users"
              ? "bg-[#b387f5] text-black font-semibold"
              : "bg-[#1f1f1f] border-[#b387f5]/40 hover:border-[#b387f5]"
          }`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={`px-4 py-2 rounded-lg border ${
            activeTab === "issues"
              ? "bg-[#b387f5] text-black font-semibold"
              : "bg-[#1f1f1f] border-[#b387f5]/40 hover:border-[#b387f5]"
          }`}
          onClick={() => setActiveTab("issues")}
        >
          Issues
        </button>
      </div>

      {/* 📋 Tables */}
      <div className="bg-[#1f1f1f] rounded-xl border border-[#b387f5]/30 p-6 shadow-md overflow-x-auto">
        {activeTab === "users" ? (
          <UsersTable users={users} refresh={fetchData} />
        ) : (
          <IssuesTable issues={issues} refresh={fetchData} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
