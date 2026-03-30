import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "./utils/logout";
import "./UserDashboard.css";

// ✅ Import images properly (Vite compatible)
import profileImg from "./images/profile.png";

const UserDashboard = () => {
  const navigate = useNavigate();

  // 🔒 Authentication Check: redirect to login if no token or role is wrong
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || role !== "user") {
      logout(navigate);
    }
  }, [navigate]);

  // Get username from localStorage
  const userName = localStorage.getItem("userName") || "User";

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* Post Complaint */}
          <div
            className="dashboard-card"
            onClick={() => navigate("/post-complaint")}
          >
            <div className="card-icon-wrapper">
              <i className="ri-file-text-line card-icon-ri"></i>
            </div>
            <h2>Post a Complaint</h2>
          </div>

          {/* View Events */}
          <div
            className="dashboard-card"
            onClick={() => navigate("/viewevents")}
          >
            <div className="card-icon-wrapper">
              <i className="ri-calendar-event-line card-icon-ri"></i>
            </div>
            <h2>View Events</h2>
          </div>

          {/* View Status */}
          <div
            className="dashboard-card"
            onClick={() => navigate("/viewstatus")}
          >
            <div className="card-icon-wrapper">
              <i className="ri-bar-chart-box-line card-icon-ri"></i>
            </div>
            <h2>View Status</h2>
          </div>

          {/* Feedback */}
          <div
            className="dashboard-card"
            onClick={() => navigate("/feedback")}
          >
            <div className="card-icon-wrapper">
              <i className="ri-feedback-line card-icon-ri"></i>
            </div>
            <h2>Feedback</h2>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;