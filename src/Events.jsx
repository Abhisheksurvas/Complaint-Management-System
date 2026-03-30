import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "./Events.css";

const Events = () => {
  const [eventDetails, setEventDetails] = useState({
    date: "",
    department: "",
    title: "",
    venue: "",
    time: "",
    timePeriod: "AM",
    description: "",
  });

  const departments = ["CSE", "ENTC", "ELE", "MECH", "CIVIL"];
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventDetails({
      ...eventDetails,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventDate = new Date(eventDetails.date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to compare only dates

    if (eventDate < currentDate) {
      toast.error("Event date cannot be in the past.");
      return;
    }

    const loadingToast = toast.loading("Posting event...");

    try {
      const response = await axios.post("http://localhost:5000/admin/post-event", eventDetails);
      if (response.data.success) {
        toast.success("Event Posted Successfully!", { id: loadingToast });
        setEventDetails({
          date: "",
          department: "",
          title: "",
          venue: "",
          time: "",
          timePeriod: "AM",
          description: "",
        });
        setTimeout(() => navigate("/viewevents"), 1500);
      }
    } catch (error) {
      console.error("Error posting event:", error);
      toast.error("Failed to post event", { id: loadingToast });
    }
  };

  return (
    <div className="post-events-page">
      <div className="post-events-card">
        <header className="page-header">
          <button className="back-btn-minimal" onClick={() => navigate(-1)}>
            <i className="ri-arrow-left-line"></i> Back
          </button>
          <h1>Post New Event</h1>
          <p className="subtitle">Fill in the details to announce a new campus event</p>
        </header>

        <form className="event-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="title">Event Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={eventDetails.title}
                onChange={handleChange}
                placeholder="e.g., Annual Tech Symposium 2026"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Event Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={eventDetails.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Organizing Department</label>
              <select
                id="department"
                name="department"
                value={eventDetails.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="venue">Venue</label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={eventDetails.venue}
                onChange={handleChange}
                placeholder="e.g., Main Auditorium"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Time</label>
              <div className="time-input-group">
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={eventDetails.time}
                  onChange={handleChange}
                  required
                />
                <select
                  name="timePeriod"
                  value={eventDetails.timePeriod}
                  onChange={handleChange}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Event Description</label>
              <textarea
                id="description"
                name="description"
                value={eventDetails.description}
                onChange={handleChange}
                placeholder="Describe what the event is about..."
                rows="4"
              ></textarea>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn-primary">
              <i className="ri-send-plane-fill"></i> Post Event Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Events;