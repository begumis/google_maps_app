import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles.css'; 

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/users/register', { email, password });
      setMessage('User registered successfully');
      setTimeout(() => {
        navigate('/login');
      }, 2000); // 2 seconds delay before redirecting
    } catch (error) {
      setMessage('Register error: ' + error.response.data.message);
    }
  };

  return (
    <div className="container">
      <h1>Register</h1>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleRegister} className="form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="input"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="input"
        />
        <button type="submit" className="button">Register</button>
      </form>
      <p className="redirect">
        Already have an account? <a href="/login">Log In</a>
      </p>
    </div>
  );
}

export default Register;
