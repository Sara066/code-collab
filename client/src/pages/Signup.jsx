import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authStyles as s } from './authStyles';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, username);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={s.fullscreenWrapper}>
      <form onSubmit={handleSubmit} style={s.formCard}>
        <div style={s.header}>
          <h2 style={s.title}>Create account</h2>
          <p style={s.subtitle}>Join CodeCollab</p>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        <div style={s.inputContainer}>
          <label style={s.label}>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={s.input} required />
        </div>

        <div style={s.inputContainer}>
          <label style={s.label}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={s.input} required />
        </div>

        <div style={s.inputContainer}>
          <label style={s.label}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={s.input} required minLength={8} />
        </div>

        <button type="submit" style={s.button}>Sign up</button>

        <p style={s.switchText}>
          Already have an account? <Link to="/login" style={s.link}>Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
