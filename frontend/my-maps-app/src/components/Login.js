import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles.css'; 

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/users/login', { email, password });
      console.log('Response data:', response.data); 
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token); 
      console.log('Logged in successfully');
      console.log('Token:', response.data.token);
      navigate('/map'); // Navigate to the map page
    } catch (error) {
      setMessage('Login error: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container">
      <h1>Login</h1>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleLogin} className="form">
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
        <button type="submit" className="button">Log In</button>
      </form>
      <p className="redirect">
        Don't have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}

export default Login;
