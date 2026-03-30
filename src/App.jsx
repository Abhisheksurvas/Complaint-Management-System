// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Components
import Navbar from './Navbar';
import ProtectedRoute from './ProtectedRoute';
import Home from './Home';
import UserLogin from './UserLogin';
import AdminLogin from './AdminLogin';
import UserSignup from './UserSignup';       // ⚠️ Make sure these exist!
import AdminSignup from './AdminSignup';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import PostComplaint from './PostComplaint';
import Feedback from './Feedback';
import ViewComplaints from './ViewComplaints';
import ViewFeedback from './ViewFeedback';
import StatusPage from './StatusPage';
import ViewStatus from './ViewStatus';
import Events from './Events';
import ViewEvents from './ViewEvents';

import './App.css';

import EditProfile from './EditProfile';
import AdminProfile from './AdminProfile';
import { Toaster } from 'react-hot-toast';
import UserProfile from './UserProfile';
import EditUserProfile from './EditUserProfile';
import Sidebar from './Sidebar';
import { useState, useEffect } from 'react';
const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  return (
    <div className="app-wrapper">
      <Toaster position="top-center" reverseOrder={false} /> 
      <Navbar toggleSidebar={toggleSidebar} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <Sidebar isOpen={isSidebarOpen} />
      <div className={`main-layout-container ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
        <Routes>
...
          <Route path="/" element={<Home />} />
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/dashboard/userprofile" element={<ProtectedRoute role="user"><UserProfile /></ProtectedRoute>} />
          <Route path="/user/dashboard/userprofile/edit" element={<ProtectedRoute role="user"><EditUserProfile /></ProtectedRoute>} />
          <Route path="/admin/dashboard/adminprofile" element={<ProtectedRoute role="admin"><AdminProfile /></ProtectedRoute>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/user/signup" element={<UserSignup />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/post-complaint" element={<PostComplaint />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/view-complaints" element={<ViewComplaints />} />
          <Route path="/view-feedback" element={<ViewFeedback />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/viewstatus" element={<ViewStatus />} />
          <Route path="/events" element={<Events />} />
          <Route path="/viewevents" element={<ViewEvents />} />
          <Route path="/user/dashboard" element={ <ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={ <ProtectedRoute role="admin"> <AdminDashboard /></ProtectedRoute> }/>
          <Route path="/admin/dashboard/AdminProfile/editprofile" element={<EditProfile />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
