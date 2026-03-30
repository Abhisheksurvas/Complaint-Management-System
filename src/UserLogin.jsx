import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const UserLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('userRole', 'user');
        localStorage.setItem('userName', formData.username);
        localStorage.setItem('user', JSON.stringify(result.user));
        navigate('/user/dashboard', { replace: true });
      } else {
        alert(result.error || 'Login failed');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  return (
    <div className="user-login-container">
      <div className="user-login-box">
        <div className="container">
          {/*  Left Panel */}
        <div className="left-panel">
        <h2>User Login</h2>
        <form onSubmit={handleSubmit}>

        <div className="input-group">
            <i className="ri-user-fill"></i>
              <input type="text" name="fakeuser" autoComplete="username" style={{ display: 'none' }} />
            <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
            </div>

            <div className="input-group">
            <i className="ri-lock-fill"></i>
          <input type="password" name="fakepass" autoComplete="new-password" style={{ display: 'none' }} />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
          </div>

          <button type="submit" className="submit-btn">Login</button>
          <button type="button" className="cancel-btn" onClick={() => window.history.back()}>Cancel</button>
        
            <div className="footer">
          Don't have an account? <a href="/user/signup">Sign up</a>
        </div>
        </form>
        </div>
  {/*  Right Panel */}
            <div className="right-panel">
            <div className="welcome-text">
              <h2>Welcome Back</h2>
            </div>
          </div>
          </div>
      </div>
    </div>
  );
};

export default UserLogin;