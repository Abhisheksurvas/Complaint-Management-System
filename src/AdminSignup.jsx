import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserSignup.css';
import blackBackground from './images/blackBackground.png';

const AdminSignup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    adminName: '',
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({
    adminName: '',
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === 'mobile') {
      updatedValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: updatedValue,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Re-validate on change
    switch (name) {
      case 'adminName':
        validateAdminName(updatedValue);
        break;
      case 'username':
        validateUsername(updatedValue);
        break;
      case 'email':
        validateEmail(updatedValue);
        break;
      case 'mobile':
        validateMobile(updatedValue);
        break;
      case 'password':
        validatePassword(updatedValue);
        validateConfirmPassword(updatedValue, formData.confirmPassword);
        break;
      case 'confirmPassword':
        validateConfirmPassword(formData.password, updatedValue);
        break;
      default:
        break;
    }
  };

  const validateAdminName = (name) => {
    const error = name.trim().length < 2 ? 'Admin Name must be at least 2 characters' : '';
    setErrors((prev) => ({ ...prev, adminName: error }));
  };

  const validateUsername = (username) => {
    const error = username.trim().length < 3 ? 'Username must be at least 3 characters' : '';
    setErrors((prev) => ({ ...prev, username: error }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let error = '';

    if (!email) {
      error = 'Email is required';
    } else if (!emailRegex.test(email)) {
      error = 'Invalid email format';
    }

    setErrors((prev) => ({ ...prev, email: error }));
  };

  const validateMobile = (mobile) => {
    const mobileRegex = /^[0-9]{10}$/; // Exactly 10 digits
    const error = mobile && !mobileRegex.test(mobile)
      ? 'Mobile number must be 10 digits, numbers only'
      : mobile.trim() === ''
        ? 'Mobile number is required'
        : '';
    setErrors((prev) => ({ ...prev, mobile: error }));
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const error = password
      ? passwordRegex.test(password)
        ? ''
        : 'Password must be ≥8 chars with uppercase, lowercase, number & special char (@$!%*?&)'
      : 'Password is required';
    setErrors((prev) => ({ ...prev, password: error }));
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    const error =
      confirmPassword === ''
        ? 'Please confirm your password'
        : password !== confirmPassword
          ? 'Passwords do not match'
          : '';
    setErrors((prev) => ({ ...prev, confirmPassword: error }));
  };

  const validateAllFields = () => {
    validateAdminName(formData.adminName);
    validateUsername(formData.username);
    validateEmail(formData.email);
    validateMobile(formData.mobile);
    validatePassword(formData.password);
    validateConfirmPassword(formData.password, formData.confirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    validateAllFields();

    // Check if any field has an error
    const hasErrors = Object.values(errors).some((err) => err !== '');
    const hasEmptyFields = Object.values(formData).some((val) => val.trim() === '');

    if (hasEmptyFields || hasErrors) {
      alert('Please fill in all fields and fix errors before submitting.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName: formData.adminName,
          username: formData.username,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Admin signup successful!');
        navigate('/admin/login');
      } else {
        alert(data.error || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup Error:', error);
      alert('An error occurred during signup. Please try again.');
    }
  };

  return (
    <div className="user-signup-container" style={{ backgroundImage: `url(${blackBackground})` }}>
      <div className="user-signup-box">
        <h2>Admin Signup</h2>
        <form onSubmit={handleSubmit}>
          {/* Admin Name */}
          <div className="form-group">
            <input
              name="adminName"
              type="text"
              placeholder="Admin Name"
              value={formData.adminName}
              onChange={handleChange}
              className={`form-input ${errors.adminName ? 'error-input' : ''}`}
              required
            />
            {errors.adminName && <span className="error">{errors.adminName}</span>}
          </div>

          {/* Username */}
          <div className="form-group">
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={`form-input ${errors.username ? 'error-input' : ''}`}
              required
            />
            {errors.username && <span className="error">{errors.username}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <input
              name="email"
              type="email"
              placeholder="Email ID"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error-input' : ''}`}
              required
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          {/* Mobile Number */}
          <div className="form-group">
            <input
              name="mobile"
              type="tel"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              className={`form-input ${errors.mobile ? 'error-input' : ''}`}
              maxLength="10"
              required
            />
            {errors.mobile && <span className="error">{errors.mobile}</span>}
          </div>

          {/* Password with Show/Hide */}
          <div className="form-group">
            <div className="password-container">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error-input' : ''}`}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          {/* Confirm Password with Show/Hide */}
          <div className="form-group">
            <div className="password-container">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'error-input' : ''}`}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            className="signup-button"
            disabled={Object.values(errors).some(err => err !== '')}
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSignup;