import React from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const UsersTable = ({ users, refresh }) => {
  const token = localStorage.getItem("token");

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refresh();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="overflow-x-auto">
      <h3 className="text-xl font-semibold text-[#b387f5] mb-4">Users</h3>
      <table className="min-w-full text-sm text-left border border-[#b387f5]/30 rounded-xl overflow-hidden">
        <thead className="bg-[#1f1f1f] text-[#b387f5] uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {users?.length > 0 ? (
            users.map((user) => (
              <tr
                key={user._id}
                className="border-t border-[#b387f5]/20 hover:bg-[#2a2a2a] transition-all"
              >
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3 text-gray-300">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-[#b387f5]/20 text-[#b387f5]"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDelete(user._id)}
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
                colSpan="5"
                className="px-4 py-6 text-center text-gray-500 italic"
              >
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
