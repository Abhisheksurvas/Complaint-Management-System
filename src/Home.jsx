import React from "react";
// import LandingImage from "./images/--Pngtree—customer support representative talking_5412869.png"; // Comment out the problematic import
import "./Home.css";
import blackBackground from './images/blackBackground.png'
const Home = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-text">
            <h1 className="hero-title">
              Resolution at Your <span className="highlight">Fingertips</span>
            </h1>
            <p className="hero-description">
              A dedicated platform designed to address student concerns effectively. From academic issues to campus facilities, we're committed to making your college experience better through prompt resolution and transparent communication.
            </p>
            <div className="hero-buttons">
              <button className="primary-btn" onClick={() => window.location.href='/user/login'}>Get Started</button>
              <button className="secondary-btn" onClick={() => window.location.href='/viewevents'}>Explore Events</button>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src={blackBackground} 
              alt="Complaint Management" 
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Easy Posting</h3>
            <p>Convenient complaint posting for all campus issues with just a few clicks.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Real-time Tracking</h3>
            <p>Track the real-time status of your submitted complaints from start to resolution.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Event Updates</h3>
            <p>Stay informed with timely updates and announcements on campus events.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Feedback Loop</h3>
            <p>A comprehensive feedback system to help us continuously improve our services.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;