import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";
import profileImg from "./images/profile.png";

const EditUserProfile = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    mobile: "",
    gender: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(profileImg);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const res = await axios.get("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data.user;
        setFormData({
          username: user.username || "",
          email: user.email || "",
          fullName: user.name || "",
          mobile: user.mobile || "",
          gender: user.gender || "",
        });
        if (user.profilePicture) {
          setPreviewUrl(user.profilePicture);
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const updateData = new FormData();
      updateData.append("username", formData.username);
      updateData.append("email", formData.email);
      updateData.append("fullName", formData.fullName);
      updateData.append("mobile", formData.mobile);
      updateData.append("gender", formData.gender);
      if (profilePicture) {
        updateData.append("profilePicture", profilePicture);
      }

      await axios.put("http://localhost:5000/api/user/profile", updateData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Profile updated successfully!");
      navigate("/user/dashboard/userprofile");
    } catch (err) {
      console.error("Update profile error:", err);
      setError(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="status-message">Loading profile...</p>;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>Edit User Profile</h2>
        
        <div className="profile-picture-section">
          <div className="profile-picture-wrapper">
            <img src={previewUrl} alt="Profile" className="profile-picture-preview" />
          </div>
          <div className="picture-buttons">
            <label className="upload-btn">
              <i className="ri-camera-line"></i> Upload Photo
              <input
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                hidden
              />
            </label>
            {previewUrl !== profileImg && (
              <button 
                className="remove-btn" 
                onClick={() => {
                  setProfilePicture(null);
                  setPreviewUrl(profileImg);
                }}
              >
                <i className="ri-delete-bin-line"></i> Remove
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="info">
            <label>Full Name:</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="info">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="info">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="info">
            <label>Mobile:</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>
          <div className="info">
            <label>Gender:</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div className="button-group">
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserProfile;
