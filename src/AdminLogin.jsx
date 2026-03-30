// src/AdminLogin.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ Import Link
import 'remixicon/fonts/remixicon.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'user') {
      navigate('/user/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value })); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        
        localStorage.setItem('authToken', result.token); 
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userName', formData.username);

        navigate('/admin/dashboard', { replace: true });
      } else {
        alert(result.message || result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Server error. Please try again.');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="container">
          {/* Left Panel */}
          <div className="left-panel">
            <div className="welcome-text">
              <h2>Welcome Back</h2>
            </div>
          </div>
          <div className="right-panel">
            <h2>Admin Login</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <i className="ri-user-fill"></i>
                
                <input type="text" name="fakeuser" autoComplete="username" style={{ display: 'none' }} />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username} 
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <i className="ri-lock-fill"></i>
                <input type="password" name="fakepass" autoComplete="new-password" style={{ display: 'none' }} />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password} 
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="submit-btn">
                Login
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>

              <div className="footer">
                Don't have an account?{' '}
                <Link to="/admin/signup">Sign up</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;