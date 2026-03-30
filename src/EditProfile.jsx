// src/components/EditProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditProfile.css';
import './AdminSignup.jsx';

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    mobile: '',
    password: '',
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch current admin data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken'); // ✅ Correct token key
        if (!token) throw new Error('No authentication token');

        const res = await axios.get('http://localhost:5000/api/admin/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const admin = res.data.admin;
        if (!admin) throw new Error('Admin data not found');

        setFormData({
          name: admin.adminName || '',
          username: admin.username || '',
          email: admin.email || '',
          mobile: admin.mobile || '',
        });
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load profile. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Validation for mobile number
    if (formData.mobile && !/^[0-9]{10}$/.test(formData.mobile)) {
      setError('Mobile number must be 10 digits');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken'); // ✅ Consistent token key
      if (!token) throw new Error('Not authenticated');

      // Build payload: only include password if user entered one
      const payload = { 
        adminName: formData.name, // Ensure we send adminName
        username: formData.username,
        email: formData.email,
        mobile: formData.mobile
      };
      if (password.trim()) {
        payload.password = password;
      }

      await axios.put('http://localhost:5000/api/admin/profile', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Profile updated successfully!');
      navigate('/admin/dashboard/adminprofile'); // ✅ Go back to profile view
    } catch (err) {
      console.error('Update error:', err);
      const msg = err.response?.data?.error || 'Failed to update profile';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/dashboard/adminprofile');
  };

  if (loading) return <div className="profile-page"><p>Loading...</p></div>;
  if (error && !formData.username) return <div className="profile-page"><p style={{ color: 'red' }}>{error}</p></div>;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>Edit Admin Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="info">
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="info">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="info">
            <label htmlFor="email">Email ID:</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="info">
            <label htmlFor="mobile">Mobile No:</label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
              maxLength="10"
            />
          </div>

          <div className="info">
            <label htmlFor="password">New Password:</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
          </div>

          {error && <p className="error">{error}</p>}

          <div className="button-group">
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;