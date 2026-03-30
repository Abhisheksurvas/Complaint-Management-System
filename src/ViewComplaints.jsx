import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ViewComplaints.css";

const API_BASE = "http://localhost:5000";

const ViewComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  // Fetch complaints
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/get-complaints`);
      if (!res.ok) throw new Error("Failed to fetch complaints");
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete single complaint
  const handleDelete = async (id) => {
    if (!id) return alert("Invalid complaint ID");
    if (!window.confirm("Delete this complaint?")) return;

    try {
      const res = await fetch(`${API_BASE}/delete-complaint/${id}`, {
        method: "DELETE",
      });
      if (res.ok) setComplaints((prev) => prev.filter((c) => c._id !== id));
      else alert("Failed to delete complaint");
    } catch (err) {
      console.error(err);
    }
  };

  // Delete all complaints
  const handleDeleteAll = async () => {
    if (!window.confirm("Delete ALL complaints?")) return;

    try {
      const res = await fetch(`${API_BASE}/delete-all-complaints`, {
        method: "DELETE",
      });
      if (res.ok) setComplaints([]);
      else alert("Failed to delete all complaints");
    } catch (err) {
      console.error(err);
    }
  };

  // Update status
  const handleStatusChange = async (complaintId, newStatus) => {
    if (!complaintId) return alert("Invalid complaint ID");

    setUpdatingId(complaintId);

    try {
      const res = await fetch(`${API_BASE}/update-status/${complaintId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setComplaints((prev) =>
          prev.map((c) =>
            c._id === complaintId ? { ...c, status: newStatus } : c
          )
        );
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  // View complaint in modal
  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
  };

  // Close modal
  const closeModal = () => {
    setSelectedComplaint(null);
  };

  // Get status configuration (color, icon, label)
  const getStatusConfig = (status) => {
    const statusLower = (status || "pending").toLowerCase().replace(/\s/g, "-");
    
    const config = {
      "resolved": { color: "#28a745", bgColor: "#d4edda", label: "Resolved", icon: "✓", cardBorder: "#28a745" },
      "pending": { color: "#dc3545", bgColor: "#f8d7da", label: "Pending", icon: "✕", cardBorder: "#dc3545" },
      "rejected": { color: "#dc3545", bgColor: "#f8d7da", label: "Rejected", icon: "✕", cardBorder: "#dc3545" },
      "in-progress": { color: "#ffc107", bgColor: "#fff3cd", label: "In Progress", icon: "⟳", cardBorder: "#ffc107" },
      "yet-to-begin": { color: "#dc3545", bgColor: "#f8d7da", label: "Yet to Begin", icon: "○", cardBorder: "#dc3545" },
    };

    return config[statusLower] || { color: "#ffc107", bgColor: "#fff3cd", label: status, icon: "⟳", cardBorder: "#ffc107" };
  };

  const handleBack = () => navigate(-1);

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading complaints...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="view-complaints-container">
      <h1>Complaints</h1>

      <div className="button-group">
        <button className="btn btn-back" onClick={handleBack}>
          ← Back
        </button>
        <button className="btn btn-delete-all" onClick={handleDeleteAll}>
          Delete All Complaints
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="cards-container">
          <div className="no-complaints">No complaints found.</div>
        </div>
      ) : (
        <div className="cards-container">
          {complaints.map((complaint) => {
            const status = complaint.status || "Yet to Begin";
            const statusConfig = getStatusConfig(status);

            return (
              <div 
                className="complaint-card" 
                key={complaint._id}
                style={{ borderTop: `5px solid ${statusConfig.cardBorder}` }}
              >
                <div 
                  className="card-header" 
                  style={{ backgroundColor: statusConfig.cardBorder }}
                >
                  <h3>{complaint.username}</h3>
                  <div className="status-indicator" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      className="status-circle"
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        backgroundColor: statusConfig.color,
                        border: "2px solid white",
                        boxShadow: `0 0 0 2px ${statusConfig.color}`,
                      }}
                    />
                    <span
                      className="status-badge"
                      style={{
                        fontSize: "0.85rem",
                        padding: "4px 10px",
                        backgroundColor: statusConfig.bgColor,
                        color: statusConfig.color,
                        border: `1px solid ${statusConfig.color}`,
                        borderRadius: "20px",
                        fontWeight: "600",
                      }}
                    >
                      {statusConfig.icon} {statusConfig.label}
                    </span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-row">
                    <span className="card-label">Complaint:</span>
                    <span className="card-value">
                      {complaint.complaintText?.substring(0, 50) || "N/A"}
                      {complaint.complaintText?.length > 50 ? "..." : ""}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Location:</span>
                    <span className="card-value">
                      {complaint.location || "N/A"} - {complaint.subLocation || "N/A"}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Room:</span>
                    <span className="card-value">{complaint.roomNo || "N/A"}</span>
                  </div>
                </div>
                <div className="card-footer">
                  <button
                    className="btn-view"
                    onClick={() => handleViewComplaint(complaint)}
                  >
                    See Complaint
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(complaint._id)}
                  >
                    Delete
                  </button>
                </div>
                <div className="card-status-select">
                  <label htmlFor={`status-${complaint._id}`}>Update Status:</label>
                  <select
                    id={`status-${complaint._id}`}
                    value={status}
                    onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                    disabled={updatingId === complaint._id}
                  >
                    <option value="Yet to Begin">Yet to Begin</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for viewing complaint details */}
      {selectedComplaint && (
        <div className="modal show" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedComplaint.username}</h3>
              <button className="close-btn" onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-row">
                <span className="modal-label">Status:</span>
                <span className="modal-value">
                  <span
                    className="status-badge"
                    style={{
                      fontSize: "1rem",
                      padding: "8px 16px",
                      backgroundColor: getStatusConfig(selectedComplaint.status).bgColor,
                      color: getStatusConfig(selectedComplaint.status).color,
                      border: `2px solid ${getStatusConfig(selectedComplaint.status).color}`,
                      borderRadius: "20px",
                      fontWeight: "600",
                    }}
                  >
                    {getStatusConfig(selectedComplaint.status).icon} {getStatusConfig(selectedComplaint.status).label}
                  </span>
                </span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Complaint ID:</span>
                <span className="modal-value">{selectedComplaint._id}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Complaint:</span>
                <span className="modal-value">{selectedComplaint.complaintText}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Date:</span>
                <span className="modal-value">
                  {new Date(selectedComplaint.date).toLocaleDateString()}
                </span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Location:</span>
                <span className="modal-value">{selectedComplaint.location}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Sub-Location:</span>
                <span className="modal-value">{selectedComplaint.subLocation || "N/A"}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Room Number:</span>
                <span className="modal-value">{selectedComplaint.roomNo || "N/A"}</span>
              </div>
              {selectedComplaint.image && (
                <img
                  src={selectedComplaint.image}
                  alt="Complaint Image"
                  className="modal-image"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewComplaints;
