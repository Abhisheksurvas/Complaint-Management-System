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
  const [selectedEvent, setSelectedEvent] = useState(null);
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

  const handleViewClick = (event) => {
    setSelectedEvent(event);
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
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>Upcoming Events</h1>
        <div className="header-actions">
          <button className="back-button" onClick={() => navigate(-1)}>
            <i className="ri-arrow-left-line"></i> Back
          </button>
        </div>
      </div>

      {loading && (
        <div className="status-container">
          <div className="loader"></div>
          <p className="status-message">Loading upcoming events...</p>
        </div>
      )}
      
      {error && (
        <div className="status-container">
          <p className="status-message error">{error}</p>
          <button className="retry-btn" onClick={fetchEvents}>Retry</button>
        </div>
      )}

      <div className="events-list">
        {!loading && !error && events.length > 0 ? (
          events.map((event) => (
            <div key={event._id} className="event-card">
              <div className="event-badge">{event.department}</div>
              <div className="event-content">
                <h2>{event.title}</h2>
                <div className="event-info-grid">
                  <div className="info-item">
                    <i className="ri-calendar-line"></i>
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="info-item">
                    <i className="ri-time-line"></i>
                    <span>{event.time} {event.timePeriod}</span>
                  </div>
                  <div className="info-item">
                    <i className="ri-map-pin-line"></i>
                    <span>{event.venue}</span>
                  </div>
                </div>
                <p className="event-description">
                  {event.description?.substring(0, 100)}
                  {event.description?.length > 100 ? "..." : ""}
                </p>
                <button className="view-event-btn" onClick={() => handleViewClick(event)}>
                   View Event
                </button>
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

      {/* View Modal */}
      {selectedEvent && (
        <div className="edit-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="edit-modal view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEvent.title}</h2>
              <button className="close-btn-minimal" onClick={() => setSelectedEvent(null)}>&times;</button>
            </div>
            <div className="event-detail-badge">{selectedEvent.department}</div>
            
            <div className="modal-info-grid">
              <div className="info-group">
                <i className="ri-calendar-line"></i>
                <div className="info-content">
                  <label>Date</label>
                  <span>{formatDate(selectedEvent.date)}</span>
                </div>
              </div>
              <div className="info-group">
                <i className="ri-time-line"></i>
                <div className="info-content">
                  <label>Time</label>
                  <span>{selectedEvent.time} {selectedEvent.timePeriod}</span>
                </div>
              </div>
              <div className="info-group">
                <i className="ri-map-pin-line"></i>
                <div className="info-content">
                  <label>Venue</label>
                  <span>{selectedEvent.venue}</span>
                </div>
              </div>
            </div>

            <div className="modal-description">
              <label>Description</label>
              <p>{selectedEvent.description || "No description provided."}</p>
            </div>

            <div className="modal-buttons">
              <button className="close-btn-primary" onClick={() => setSelectedEvent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

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