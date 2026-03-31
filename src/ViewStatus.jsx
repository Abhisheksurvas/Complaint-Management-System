import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ViewStatus.css";

const API_BASE = "http://localhost:5000";

const ViewStatus = () => {
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [editFormData, setEditFormData] = useState({
    complaintText: "",
    location: "",
    subLocation: "",
    roomNo: "",
    date: ""
  });
  const navigate = useNavigate();

  // Locations that require a sub-location (matching PostComplaint logic)
  const locationsWithSub = ["college", "hostel", "gym", "bus"];

  // Fetch status data
  const fetchData = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const email = user ? user.email : "";
    const username = user ? user.username : "";
    
    try {
      const res = await fetch(`${API_BASE}/get-status?email=${email}&username=${username}`);
      if (!res.ok) throw new Error("Failed to fetch status");
      const data = await res.json();
      setStatusData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  // Edit logic
  const handleEditClick = (item) => {
    const complaint = typeof item.complaintId === "object" ? item.complaintId : {};
    setEditingComplaint(item);
    setEditFormData({
      complaintText: complaint.complaintText || "",
      location: complaint.location || "",
      subLocation: item.subLocation || complaint.subLocation || "",
      roomNo: complaint.roomNo || "",
      date: complaint.date ? new Date(complaint.date).toISOString().split('T')[0] : ""
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "location") {
        updated.subLocation = "";
        updated.roomNo = "";
      }
      return updated;
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const complaintId = typeof editingComplaint.complaintId === "string" 
      ? editingComplaint.complaintId 
      : editingComplaint.complaintId?._id;

    try {
      const res = await fetch(`${API_BASE}/update-complaint/${complaintId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        alert("Complaint updated successfully!");
        setEditingComplaint(null);
        fetchData();
      } else {
        alert("Failed to update complaint");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating complaint");
    }
  };

  // View complaint details in modal
  const handleViewDetails = (item) => {
    setSelectedComplaint(item);
  };

  // Close modal
  const closeModal = () => {
    setSelectedComplaint(null);
    setEditingComplaint(null);
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
                    className="btn-edit"
                    onClick={() => handleEditClick(item)}
                  >
                    Edit
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

      {/* Modal for editing complaint details */}
      {editingComplaint && (
        <div className="modal show" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header edit-modal-header">
              <h3>Edit Complaint</h3>
              <button className="close-btn" onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditSubmit} className="edit-form">
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    name="date"
                    value={editFormData.date} 
                    onChange={handleEditChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <select name="location" value={editFormData.location} onChange={handleEditChange} required>
                    <option value="">Select Location</option>
                    <option value="college">College</option>
                    <option value="bus">Bus</option>
                    <option value="library">Library</option>
                    <option value="gym">GYM</option>
                    <option value="canteen">Canteen</option>
                    <option value="hostel">Hostel</option>
                    <option value="mess">Mess</option>            
                  </select>
                </div>

                {locationsWithSub.includes(editFormData.location) && (
                  <div className="form-group">
                    <label>Sub-Location</label>
                    <select name="subLocation" value={editFormData.subLocation} onChange={handleEditChange} required>
                      <option value="">Select SubLocation</option>
                      {editFormData.location === 'college' && (
                        <>
                          <option value="CSE">CSE</option>
                          <option value="ENTC">ENTC</option>
                          <option value="ELE">ELE</option>
                          <option value="MECH">MECH</option>
                          <option value="CIVIL">CIVIL</option>
                        </>
                      )}
                      {editFormData.location === 'bus' && <option value="college">College</option>}
                      {editFormData.location === 'hostel' && (
                        <>
                          <option value="girls">Girls</option>
                          <option value="boys">Boys</option>
                        </>
                      )}
                      {editFormData.location === 'gym' && (
                        <>
                          <option value="girls">Girls</option>
                          <option value="boys">Boys</option>
                        </>
                      )}
                    </select>
                  </div>
                )}

                {(editFormData.location === 'college' || editFormData.location === 'hostel') && editFormData.subLocation && (
                  <div className="form-group">
                    <label>Room Number</label>
                    <input
                      type="text"
                      name="roomNo"
                      placeholder="Room Number"
                      value={editFormData.roomNo}
                      onChange={handleEditChange}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Complaint Description</label>
                  <textarea
                    name="complaintText"
                    placeholder="Describe your complaint..."
                    value={editFormData.complaintText}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="modal-footer-buttons">
                  <button type="submit" className="btn btn-save">Save Changes</button>
                  <button type="button" onClick={closeModal} className="btn btn-cancel">Cancel</button>
                </div>
              </form>
            </div>
          </div>
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
