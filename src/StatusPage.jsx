import React, { useState, useEffect } from "react";
import "./StatusPage.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const StatusPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [sendingId, setSendingId] = useState(null);
  const navigate = useNavigate();

  // Fetch complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await fetch("http://localhost:5000/get-complaints");
        if (!res.ok) throw new Error("Fetch failed");

        const data = await res.json();
        setComplaints(data);

        const initialStatus = {};
        data.forEach((c) => {
          initialStatus[c._id] = c.status || "Yet to Begin";
        });
        setStatusUpdates(initialStatus);
      } catch {
        toast.error("Failed to load complaints");
      }
    };

    fetchComplaints();
  }, []);

  // Status change
  const handleStatusChange = (id, status) => {
    setStatusUpdates((prev) => ({ ...prev, [id]: status }));
  };

  // Update status
  const postStatus = async (id) => {
    setSendingId(id);
    try {
      const res = await fetch(
        `http://localhost:5000/update-status/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: statusUpdates[id] }),
        }
      );

      if (res.ok) {
        toast.success("Status updated");
        setComplaints((prev) =>
          prev.map((c) =>
            c._id === id ? { ...c, status: statusUpdates[id] } : c
          )
        );
      } else {
        toast.error("Update failed");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setSendingId(null);
    }
  };

  // Delete single complaint
const deleteComplaint = async (id) => {
  if (!window.confirm("Delete this complaint?")) return;

  try {
    const res = await fetch(
      `http://localhost:5000/delete-complaint/${id}`,
      { method: "DELETE" }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Delete error:", data);
      toast.error(data.message || "Delete failed");
      return;
    }

    toast.success("Complaint deleted successfully");

    setComplaints((prev) => prev.filter((c) => c._id !== id));
  } catch (err) {
    console.error(err);
    toast.error("Server not responding");
  }
};

  // Delete all complaints
  const deleteAllComplaints = async () => {
    if (!window.confirm("Delete ALL complaints?")) return;

    try {
      const res = await fetch(
        "http://localhost:5000/delete-all-complaints",
        { method: "DELETE" }
      );

      if (res.ok) {
        toast.success("All complaints deleted");
        setComplaints([]);
        setStatusUpdates({});
      } else {
        toast.error("Delete all failed");
      }
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div className="status-page">
      <h1 className="status-heading">Status Page</h1>

      <table className="status-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Complaint</th>
            <th>Location</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {complaints.length === 0 ? (
            <tr>
              <td colSpan="5" className="no-data">
                No complaints found
              </td>
            </tr>
          ) : (
            complaints.map((c) => (
              <tr key={c._id}>
                <td>{new Date(c.date).toLocaleDateString()}</td>
                <td>{c.complaintText}</td>
                <td>{c.location}</td>
                <td>
                  <select
                    className="status-select"
                    value={statusUpdates[c._id]}
                    onChange={(e) =>
                      handleStatusChange(c._id, e.target.value)
                    }
                  >
                    <option>Yet to Begin</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                </td>

                <td className="action-cell">
                  <button
                    className="btn btn-post"
                    onClick={() => postStatus(c._id)}
                    disabled={sendingId === c._id}
                  >
                    {sendingId === c._id ? "Sending..." : "Post"}
                  </button>

                  <i
                    className="ri-delete-bin-5-fill delete-icon"
                    title="Delete"
                    onClick={() => deleteComplaint(c._id)}
                  ></i>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="top-btn">
       

        <button className="btn btn-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
        
         <button className="btn btn-delete-all" onClick={deleteAllComplaints}>
          <i className="ri-delete-bin-6-line"></i> Delete All
        </button>
      </div>
    </div>
  );
};

export default StatusPage;
