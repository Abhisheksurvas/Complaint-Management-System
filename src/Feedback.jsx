import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import "./Feedback.css";
import "remixicon/fonts/remixicon.css"; // ✅ Make sure Remix Icons are imported

const Feedback = () => {
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !description || !rating) {
      toast.error("Please fill all fields!", {
        icon: <i className="ri-close-circle-line" style={{ fontSize: "20px"}}></i>,
      });
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/feedback", {
        date,
        description,
        rating,
      });

      if (response.data.success) {
        toast.success("Feedback submitted successfully!", {
          icon: <i className="ri-checkbox-circle-line" style={{ fontSize: "20px"}}></i>,
        });

        setDate("");
        setDescription("");
        setRating("");
        setTimeout(() => navigate(-1), 1500);
      } else {
        toast.error("Error submitting feedback. Please try again.", {
          icon: <i className="ri-close-circle-line" style={{ fontSize: "20px"  }}></i>,
        });
      }
    } catch (error) {
      toast.error("Server error. Please try again later.", {
        icon: <i className="ri-alert-line" style={{ fontSize: "20px" }}></i>,
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="feedback-container">
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

      <h1>Feedback Form</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <label>
          Feedback Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your feedback here..."
            required
          />
        </label>

        <label>
          Rating:
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Rating
            </option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value} Star{value > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </label>

        <button type="submit">Submit Feedback</button>

        <button type="button" onClick={handleBack} className="back-button">
          ← Back
        </button>
      </form>
    </div>
  );
};

export default Feedback;
