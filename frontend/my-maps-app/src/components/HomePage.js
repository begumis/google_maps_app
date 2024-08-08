import React from 'react';
import '../styles.css'; 

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to Our Application</h1>
      </header>
      <div className="home-summary">
        <p>
          Our application allows you to find nearby places based on your location. 
          Register or log in to access features that help you explore your surroundings efficiently!
        </p>
      </div>
      <div className="home-menu">
        <a href="/register" className="home-button">Register</a>
        <a href="/login" className="home-button">Login</a>
      </div>
    </div>
  );
};

export default Home;
