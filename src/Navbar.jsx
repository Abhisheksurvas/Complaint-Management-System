// src/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from './utils/logout';
import './Navbar.css';

const Navbar = ({ toggleSidebar, toggleDarkMode, isDarkMode }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('userRole'));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('userRole') === 'admin');

  useEffect(() => {
    const handleStorageChange = () => {
      const role = localStorage.getItem('userRole');
      setIsAuthenticated(!!role);
      setIsAdmin(role === 'admin');
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </button>
          <Link to="/" className="navbar-logo">
            ComplaintMS
          </Link>
        </div>
        <div className="nav-right-container">
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {isDarkMode ? <i className="ri-sun-fill"></i> : <i className="ri-moon-fill"></i>}
          </button>
          <ul className="nav-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            {!isAuthenticated ? (
              <>
                <li>
                  <Link to="/user/login" className="login-btn">User Login</Link>
                </li>
                <li>
                  <Link to="/admin/login" className="login-btn admin-login-btn">Admin Login</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to={isAdmin ? "/admin/dashboard/AdminProfile" : "/user/dashboard/UserProfile"}>
                    Profile
                  </Link>
                </li>
                <li>
                  <button className="logout-btn" onClick={() => logout(navigate)}>Logout</button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;