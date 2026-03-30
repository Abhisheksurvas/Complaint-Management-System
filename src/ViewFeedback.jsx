import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ViewFeedback.css";
import toast, { Toaster } from "react-hot-toast";


const API_BASE = "http://localhost:5000";

const ViewFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch feedbacks from backend
  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/feedback`);
      if (!res.ok) throw new Error("Failed to fetch feedbacks");
      const data = await res.json();
      setFeedbacks(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Delete single feedback
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/feedback/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete feedback");
      setFeedbacks(feedbacks.filter((f) => f._id !== id));
      toast.success("Feedback deleted successfully!"); // ✅ success toast
    } catch (err) {
      console.error(err);
      alert("Failed to delete feedback");
    }
  };

  // Delete all feedbacks
  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL feedbacks?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/feedback`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete all feedbacks");
      setFeedbacks([]);
      toast.success("All feedbacks deleted successfully!"); // ✅ success toast
    } catch (err) {
      console.error(err);
      alert("Failed to delete all feedbacks");
    }
  };

  if (loading) return <p className="vf-message">Loading feedback...</p>;
  if (error) return <p className="vf-message">{error}</p>;

  return (
    <div className="vf-container">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#333",
            color: "#fff",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
          },
        }}
      />
      <div className="vf-action-buttons">
        <button className="vf-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {feedbacks.length > 0 && (
          <button className="vf-delete-all-btn" onClick={handleDeleteAll}>
            Delete All Feedbacks
          </button>
        )}
      </div>

      <h1 className="vf-title">Feedback Overview</h1>

      {feedbacks.length === 0 ? (
        <p className="vf-message">No feedback available.</p>
      ) : (
        <table className="vf-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Rating</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((feedback) => (
              <tr key={feedback._id}>
                <td>{feedback.date || "N/A"}</td>
                <td>{feedback.description || "Not provided"}</td>
                <td>{feedback.rating || "Not rated"}</td>
                <td>
                  <button
                    className="vf-delete-btn"
                    title="Delete feedback"
                    onClick={() => handleDelete(feedback._id)}
                  >
                    <i className="ri-delete-bin-5-fill"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewFeedback;
