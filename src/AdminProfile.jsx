// src/components/AdminProfile.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminProfile.css"; // Keep if you have custom styles

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No authentication token");

        const res = await axios.get(
          "http://localhost:5000/api/admin/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAdmin(res.data.admin);
      } catch (err) {
        setError("Failed to load admin profile. Please log in again.");
        console.error("Admin profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  if (loading) return <div className="profile-container"><p>Loading...</p></div>;
  if (error) return <div className="profile-container"><p style={{ color: "red" }}>{error}</p></div>;
  if (!admin) return <div className="profile-container"><p>No admin data.</p></div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Admin Profile</h2>

        {/* 1. Name (matches 'adminName' from signup) */}
        <div className="info">
          <label>Name:</label>
          <span>{admin.adminName || "–"}</span>
        </div>

        {/* 2. Username */}
        <div className="info">
          <label>Username:</label>
          <span>{admin.username || "–"}</span>
        </div>

        {/* 3. Email ID */}
        <div className="info">
          <label>Email ID:</label>
          <span>{admin.email || "–"}</span>
        </div>

        {/* 4. Mobile No */}
        <div className="info">
          <label>Mobile No:</label>
          <span>{admin.mobile || "–"}</span>
        </div>

        {/* 5. Password (HIDDEN for security) */}
        <div className="info">
          <label>Password:</label>
          <span>••••••••</span> {/* Never show real password */}
        </div>

        <div className="profile-buttons">
          <button className="back-btn" onClick={() => navigate(-1)}>
            Back
          </button>
          <button
            className="edit-btn"
            onClick={() => navigate("/admin/dashboard/AdminProfile/editprofile")}
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;