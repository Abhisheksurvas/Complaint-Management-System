import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ViewStatus.css";

const API_BASE = "http://localhost:5000";

const ViewStatus = () => {
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const navigate = useNavigate();

  // Delete single complaint
  const handleDelete = async (id) => {
    if (!id) return alert("Invalid complaint ID");
    if (!window.confirm("Delete this complaint?")) return;

    try {
      const res = await fetch(`${API_BASE}/delete-complaint/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setStatusData((prev) =>
          prev.filter((item) => {
            const cid =
              typeof item.complaintId === "string"
                ? item.complaintId
                : item.complaintId?._id;
            return cid !== id;
          })
        );
      } else {
        alert("Failed to delete complaint");
      }
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

      if (res.ok) {
        setStatusData([]);
      } else {
        alert("Failed to delete all complaints");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // View complaint details in modal
  const handleViewDetails = (item) => {
    setSelectedComplaint(item);
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

  // Fetch status data
  useEffect(() => {
    fetch(`${API_BASE}/get-status`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch status");
        return res.json();
      })
      .then(setStatusData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="view-status-container">
      <h1>My Complaint Status</h1>

      <div className="button-group">
        <button className="btn btn-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <button
          className="btn btn-add"
          onClick={() => navigate("/post-complaint")}
        >
          + Add Complaint
        </button>
      </div>

      {statusData.length === 0 ? (
        <div className="cards-container">
          <div className="no-complaints">No complaints found</div>
        </div>
      ) : (
        <div className="cards-container">
          {statusData.map((item) => {
            const complaint =
              typeof item.complaintId === "object"
                ? item.complaintId
                : {};
            const complaintId =
              typeof item.complaintId === "string"
                ? item.complaintId
                : item.complaintId?._id;

            const status = item.status || "Pending";
            const statusConfig = getStatusConfig(status);

            return (
              <div 
                className="complaint-card" 
                key={item._id || complaintId}
                style={{ borderTop: `5px solid ${statusConfig.cardBorder}` }}
              >
                <div 
                  className="card-header" 
                  style={{ backgroundColor: statusConfig.cardBorder }}
                >
                  <h3>{complaint.username || "User"}</h3>
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
                      {complaint.location || "N/A"} - {item.subLocation || "N/A"}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Room:</span>
                    <span className="card-value">{complaint.roomNo || "N/A"}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Updated:</span>
                    <span className="card-value">
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
                <div className="card-footer">
                  <button
                    className="btn-view"
                    onClick={() => handleViewDetails(item)}
                  >
                    See Details
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(complaintId)}
                  >
                    Delete
                  </button>
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
              <h3>{selectedComplaint.complaintId?.username || "User"}</h3>
              <button className="close-btn" onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-row">
                <span className="modal-label">Status:</span>
                <span className="modal-value">
                  <div className="status-indicator" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      className="status-circle"
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: getStatusConfig(selectedComplaint.status).color,
                        border: "3px solid white",
                        boxShadow: `0 0 0 2px ${getStatusConfig(selectedComplaint.status).color}`,
                      }}
                    />
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
                  </div>
                </span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Complaint:</span>
                <span className="modal-value">
                  {selectedComplaint.complaintId?.complaintText || "N/A"}
                </span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Date:</span>
                <span className="modal-value">
                  {selectedComplaint.updatedAt
                    ? new Date(selectedComplaint.updatedAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Location:</span>
                <span className="modal-value">
                  {selectedComplaint.complaintId?.location || "N/A"}
                </span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Sub-Location:</span>
                <span className="modal-value">
                  {selectedComplaint.subLocation || "N/A"}
                </span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Room Number:</span>
                <span className="modal-value">
                  {selectedComplaint.complaintId?.roomNo || "N/A"}
                </span>
              </div>
              {selectedComplaint.complaintId?.image && (
                <img
                  src={selectedComplaint.complaintId.image}
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

export default ViewStatus;
