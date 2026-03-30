import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "./utils/logout";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Admin");
  const [recentHistory, setRecentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);

  // Fetch admin name on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      logout(navigate);
      return;
    }

    axios
      .get("http://localhost:5000/api/admin/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const admin = res.data.admin;
        // Use adminName from model or fallback to username
        const name = admin.adminName || admin.username || "Admin";
        setAdminName(name);
      })
      .catch((err) => {
        console.error("Failed to load admin profile:", err);
        const msg = err.response?.data?.error || "Failed to load admin profile. Please check your connection.";
        setError(msg);
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout(navigate);
        }
      });
  }, [navigate]);

  // Fetch recent history
  useEffect(() => {
    const fetchRecentHistory = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/recent-history?limit=5");
        if (res.ok) {
          const data = await res.json();
          setRecentHistory(data);
        } else {
          const errorData = await res.json().catch(() => ({ message: 'Server Internal Error' }));
          console.error("History fetch error:", errorData);
          setError(prev => prev || `History Error: ${errorData.message || 'Server returned 500'}`);
        }
      } catch (err) {
        console.error("Failed to fetch recent history:", err);
        setError(prev => prev || "Network error. Could not connect to the server.");
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchRecentHistory();
  }, []);

  const getStatusConfig = (status) => {
    const statusLower = (status || "pending").toLowerCase().replace(/\s/g, "-");
    const config = {
      "resolved": { color: "#155724", bgColor: "#d4edda", label: "Resolved", icon: "✓" },
      "pending": { color: "#721c24", bgColor: "#f8d7da", label: "Pending", icon: "✕" },
      "rejected": { color: "#721c24", bgColor: "#f8d7da", label: "Rejected", icon: "✕" },
      "in-progress": { color: "#856404", bgColor: "#fff3cd", label: "In Progress", icon: "⟳" },
      "yet-to-begin": { color: "#383d41", bgColor: "#e2e3e5", label: "Yet to Begin", icon: "○" },
    };
    return config[statusLower] || { color: "#383d41", bgColor: "#e2e3e5", label: status, icon: "○" };
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
      </header>

      {error && (
        <div className="error-banner" style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          width: '80%',
          textAlign: 'center',
          border: '1px solid #f5c6cb'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* View Complaints */}
          <div
            className="dashboard-card"
            onClick={() => navigate("/view-complaints")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate("/view-complaints")}
          >
            <div className="card-icon-wrapper">
               <i className="ri-file-list-3-line card-icon-ri"></i>
            </div>
            <h2>View Complaints</h2>
          </div>

          {/* Events */}
          <div
            className="dashboard-card"
            onClick={() => navigate("/events")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate("/events")}
          >
            <div className="card-icon-wrapper">
              <i className="ri-calendar-event-line card-icon-ri"></i>
            </div>
            <h2>Events</h2>
          </div>

          {/* Status */}
          <div
            className="dashboard-card"
            onClick={() => navigate("/status")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate("/status")}
          >
            <div className="card-icon-wrapper">
              <i className="ri-bar-chart-box-line card-icon-ri"></i>
            </div>
            <h2>Status</h2>
          </div>

          {/* View Feedback */}
          <div
            className="dashboard-card"
            onClick={() => navigate("/view-feedback")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate("/view-feedback")}
          >
            <div className="card-icon-wrapper">
               <i className="ri-feedback-line card-icon-ri"></i>
            </div>
            <h2>View Feedback</h2>
          </div>
        </div>

        {/* Recent History Section */}
        <div className="recent-history-section">
            <div className="section-header">
              <h2 className="section-title">
                <i className="ri-history-line"></i> Recent Status Updates
              </h2>
              <button
                className="btn-view-all"
                onClick={() => navigate("/status")}
              >
                View All
              </button>
            </div>

            <div className="history-content">
              {loadingHistory ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading history...</p>
                </div>
              ) : recentHistory.length === 0 ? (
                <div className="no-history">
                    <i className="ri-inbox-line"></i>
                    <p>No recent updates found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Complaint</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Updated At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentHistory.map((item) => {
                        const statusConfig = getStatusConfig(item.status);
                        const complaint = item.complaintId || {};
                        return (
                          <tr key={item._id}>
                            <td>
                              {item.updatedAt
                                ? new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                                : "N/A"}
                            </td>
                            <td className="complaint-text" title={complaint.complaintText}>
                              {complaint.complaintText?.substring(0, 40) || "N/A"}
                              {complaint.complaintText?.length > 40 ? "..." : ""}
                            </td>
                            <td>{complaint.location || "N/A"}</td>
                            <td>
                              <span
                                className="status-badge"
                                style={{
                                  backgroundColor: statusConfig.bgColor,
                                  color: statusConfig.color,
                                }}
                              >
                                <span className="status-icon">{statusConfig.icon}</span>
                                {statusConfig.label}
                              </span>
                            </td>
                            <td>
                              {item.updatedAt
                                ? new Date(item.updatedAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "N/A"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
      </main>
    </div>
  );
};

export default AdminDashboard;