import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostComplaint.css';

const PostComplaint = () => {
  const navigate = useNavigate();

  const [complaintText, setComplaintText] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [subLocation, setSubLocation] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [error, setError] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // ✅ Get username and email from localStorage on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, []);

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
    setSubLocation(''); // Reset subLocation when location changes
    setRoomNo(''); // Optional: reset room number too
  };

  const handleSubLocationChange = (e) => {
    setSubLocation(e.target.value);
  };

  const handleBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // Live image preview
    }
  };

  // Define which locations require a sub-location
  const locationsWithSub = ['college', 'hostel', 'gym', 'bus'];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isSubLocationRequired = locationsWithSub.includes(location);

    // Validation: all main fields + subLocation only if needed
    if (
      !complaintText ||
      !username ||
      !email ||
      !date ||
      !location ||
      (isSubLocationRequired && !subLocation)
    ) {
      setError('All required fields must be filled!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('complaintText', complaintText);
      formData.append('date', date);
      formData.append('location', location);
      formData.append('subLocation', subLocation || ''); // Send empty if not applicable
      formData.append('roomNo', roomNo || '');
      if (image) formData.append('image', image);

      const response = await fetch('http://localhost:5000/submit-complaint', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert('Your complaint was submitted successfully!');
        navigate('/user/dashboard');
      } else {
        setError('Failed to submit complaint: ' + (data.message || data.error || 'Unknown error'));
      }
    } catch (err) {
      setError('Server error: ' + err.message);
    }
  };

  return (
    <div className="post">
      <div className="container">
        <h1>Post a Complaint</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="complaint-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
          />

          <select value={location} onChange={handleLocationChange} required>
            <option value="">Select Location</option>
            <option value="college">College</option>
            <option value="bus">Bus</option>
            <option value="library">Library</option>
            <option value="gym">GYM</option>
            <option value="canteen">Canteen</option>
            <option value="hostel">Hostel</option>
            <option value="mess">Mess</option>            
          </select>

          {/* Show sub-location dropdown only for relevant locations */}
          {locationsWithSub.includes(location) && (
            <select value={subLocation} onChange={handleSubLocationChange} required>
              <option value="">Select SubLocation</option>
              {location === 'college' && (
                <>
                  <option value="CSE">CSE</option>
                  <option value="ENTC">ENTC</option>
                  <option value="ELE">ELE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </>
              )}
              {location === 'bus' && <option value="college">College</option>}
              {location === 'hostel' && (
                <>
                  <option value="girls">Girls</option>
                  <option value="boys">Boys</option>
                </>
              )}
              {location === 'gym' && (
                <>
                  <option value="girls">Girls</option>
                  <option value="boys">Boys</option>
                </>
              )}
            </select>
          )}

          {/* Room number only for College or Hostel (and only if subLocation selected) */}
          {(location === 'college' || location === 'hostel') && subLocation && (
            <input
              type="text"
              placeholder="Room Number"
              value={roomNo}
              onChange={(e) => setRoomNo(e.target.value)}
            />
          )}

          <textarea
            placeholder="Describe your complaint..."
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            required
          />

          <div className="image-upload">
            <label htmlFor="image">Upload Image:</label>
            <input type="file" id="image" accept="image/*" onChange={handleImageChange} />
            {preview && <img src={preview} alt="Preview" className="image-preview" />}
          </div>

          <button type="submit">Submit Complaint</button>

          <button type="button" onClick={handleBack} className="back-button">← Back</button>
        </form>
      </div>
    </div>
  );
};

export default PostComplaint;