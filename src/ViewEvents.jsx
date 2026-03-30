import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ViewEvents.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ViewEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setIsAdmin(role === "admin");
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/events");
      if (response.data?.events && Array.isArray(response.data.events)) {
        setEvents(response.data.events);
      } else {
        setEvents(response.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Unable to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`);
      toast.success("Event deleted successfully");
      fetchEvents();
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Failed to delete event");
    }
  };

  const handleEditClick = (event) => {
    setEditingEvent(event);
    setEditFormData({ ...event });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/events/${editingEvent._id}`, editFormData);
      toast.success("Event updated successfully");
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      console.error("Update Error:", err);
      toast.error("Failed to update event");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
  };

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>Upcoming Events</h1>
        <button className="back-button" onClick={() => navigate(-1)}>Back</button>
      </div>

      {loading && <p className="status-message">Loading events...</p>}
      {error && <p className="status-message error">{error}</p>}

      <div className="events-list">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event._id} className="event-card">
              <div className="event-content">
                <h2>{event.title}</h2>
                <p className="event-detail"><strong>Date:</strong> {formatDate(event.date)}</p>
                <p className="event-detail"><strong>Time:</strong> {event.time} {event.timePeriod}</p>
                <p className="event-detail"><strong>Dept:</strong> {event.department}</p>
                <p className="event-detail"><strong>Venue:</strong> {event.venue}</p>
                <p className="event-detail"><strong>Desc:</strong> {event.description}</p>
              </div>
              
              {isAdmin && (
                <div className="event-actions">
                  <button className="edit-btn" onClick={() => handleEditClick(event)}>
                    <i className="ri-edit-line"></i> Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(event._id)}>
                    <i className="ri-delete-bin-line"></i> Delete
                  </button>
                </div>
              )}
            </div>
          ))
        ) : !loading && !error ? (
          <p className="status-message">No events available.</p>
        ) : null}
      </div>

      {/* Edit Modal */}
      {editingEvent && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <h2>Edit Event</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input name="title" value={editFormData.title} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" name="date" value={editFormData.date} onChange={handleEditChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Time</label>
                  <input name="time" value={editFormData.time} onChange={handleEditChange} required />
                </div>
                <div className="form-group">
                  <label>Period</label>
                  <select name="timePeriod" value={editFormData.timePeriod} onChange={handleEditChange}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Department</label>
                <input name="department" value={editFormData.department} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label>Venue</label>
                <input name="venue" value={editFormData.venue} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={editFormData.description} onChange={handleEditChange} />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="save-btn">Save Changes</button>
                <button type="button" className="cancel-btn" onClick={() => setEditingEvent(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewEvents;