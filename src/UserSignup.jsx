import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserSignup.css";
import blackBackground from "./images/blackBackground.png";

const UserSignup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    gender: '',
    year: '', // Only relevant for students
    role: '', // 'student' or 'teacher'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email format';

    if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
    else if (!/^[0-9]{10}$/.test(formData.mobile))
      newErrors.mobile = 'Mobile must be 10 digits';

    if (!formData.role) newErrors.role = 'Please select your role';

    // Password validation
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!pwdRegex.test(formData.password))
      newErrors.password = 'Password must be ≥8 chars with uppercase, lowercase, number, and special char (@$!%*?&)';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (!formData.gender) newErrors.gender = 'Please select gender';

    // Year is required only for students
    if (formData.role === 'student' && !formData.year)
      newErrors.year = 'Please select your year';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    // Prepare payload (exclude confirmPassword)
    const payload = {
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
      mobile: formData.mobile,
      password: formData.password,
      gender: formData.gender,
      role: formData.role,
    };

    // Add year only if student
    if (formData.role === 'student') {
      payload.year = formData.year;
    }

    try {
      const response = await fetch("http://localhost:5000/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Signup successful as ${formData.role}!`);
        navigate("/user/login");
      } else {
        alert(result.error || "Signup failed.");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div
      className="user-signup-container"
      style={{ backgroundImage: `url(${blackBackground})` }}
    >
      <div className="user-signup-box">
        <h2>User Signup</h2>
        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="form-group">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`form-input ${errors.role ? "error-input" : ""}`}
              required
            >
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
            {errors.role && <span className="error">{errors.role}</span>}
          </div>

          {/* Full Name */}
          <div className="form-group">
            <input
              name="fullName"
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className={`form-input ${errors.fullName ? "error-input" : ""}`}
              required
            />
            {errors.fullName && <span className="error">{errors.fullName}</span>}
          </div>

          {/* Username */}
          <div className="form-group">
            <input
              name="username"
              type="text"
              placeholder="Username "
              value={formData.username}
              onChange={handleChange}
              className={`form-input ${errors.username ? "error-input" : ""}`}
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
              className={`form-input ${errors.email ? "error-input" : ""}`}
              required
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          {/* Mobile */}
          <div className="form-group">
            <input
              name="mobile"
              type="tel"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              className={`form-input ${errors.mobile ? "error-input" : ""}`}
              maxLength="10"
              required
            />
            {errors.mobile && <span className="error">{errors.mobile}</span>}
          </div>

          {/* Gender */}
          <div className="form-group">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`form-input ${errors.gender ? "error-input" : ""}`}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <span className="error">{errors.gender}</span>}
          </div>

          {/* Year (only shown if student) */}
          {formData.role === 'student' && (
            <div className="form-group">
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={`form-input ${errors.year ? "error-input" : ""}`}
                required
              >
                <option value="">Select Year</option>
                <option value="1st year">1st year</option>
                <option value="2nd year">2nd year</option>
                <option value="3rd year">3rd year</option>
                <option value="4th year">4th year</option>
              </select>
              {errors.year && <span className="error">{errors.year}</span>}
            </div>
          )}

          {/* Password */}
          <div className="form-group">
            <div className="password-wrapper">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? "error-input" : ""}`}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <div className="password-wrapper">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? "error-input" : ""}`}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>

          <p className="note">
            * Students: Use your email as username.<br />
            * Teachers: Use your official email.
          </p>

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

export default UserSignup;