import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";
import profileImg from "./images/profile.png";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const res = await axios.get("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.user);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Failed to load profile. Redirecting to login...");
        setTimeout(() => {
          navigate("/user/login");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!profile) return <p>No profile data.</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>User Profile</h2>
        <div className="profile-picture-wrapper">
          <img src={profileImg} alt="Profile" className="profile-picture" />
        </div>
        <div className="info">
          <label>Full Name:</label>
          <span>{profile.name}</span>
        </div>
        <div className="info">
          <label>Username:</label>
          <span>{profile.username}</span>
        </div>
        <div className="info">
          <label>Email:</label>
          <span>{profile.email}</span>
        </div>
        <div className="info">
          <label>Mobile:</label>
          <span>{profile.mobile}</span>
        </div>
        <div className="info">
          <label>Gender:</label>
          <span>{profile.gender}</span>
        </div>
        <div className="profile-buttons">
          <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
          <button className="edit-btn" onClick={() => navigate("/user/dashboard/userprofile/edit")}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;