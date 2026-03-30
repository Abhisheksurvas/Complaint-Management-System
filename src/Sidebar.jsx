import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('userRole'));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('userRole') === 'admin');

  useEffect(() => {
    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      const role = localStorage.getItem('userRole');
      setIsAuthenticated(!!role);
      setIsAdmin(role === 'admin');
    };

    handleStorageChange(); // Check on mount
    window.addEventListener('storage', handleStorageChange);
    
    // Also check on every render (for same-tab changes)
    const interval = setInterval(handleStorageChange, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h3>Menu</h3>
      </div>
      <ul className="sidebar-links">
        <li>
          <NavLink to="/" end>Home</NavLink>
        </li>
        {isAuthenticated && (
          <>
            <li>
              <NavLink to={isAdmin ? "/admin/dashboard" : "/user/dashboard"} end>
                Dashboard
              </NavLink>
            </li>
            {!isAdmin && (
              <>
                <li>
                  <NavLink to="/post-complaint">Post Complaint</NavLink>
                </li>
                <li>
                  <NavLink to="/viewstatus">View Status</NavLink>
                </li>
              </>
            )}
            {isAdmin && (
              <>
                <li>
                  <NavLink to="/view-complaints">Manage Complaints</NavLink>
                </li>
                <li>
                  <NavLink to="/events">Post Events</NavLink>
                </li>
              </>
            )}
            <li>
              <NavLink to="/viewevents">Events</NavLink>
            </li>
            <li>
              <NavLink to="/feedback">Feedback</NavLink>
            </li>
          </>
        )}
        {!isAuthenticated && (
          <>
            <li>
              <NavLink to="/user/login">User Login</NavLink>
            </li>
            <li>
              <NavLink to="/admin/login">Admin Login</NavLink>
            </li>
            <li>
              <NavLink to="/viewevents">View Events</NavLink>
            </li>
            <li>
              <a href="/#about">About Us</a>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;