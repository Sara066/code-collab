import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authStyles as s } from './authStyles';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={s.fullscreenWrapper}>
      <form onSubmit={handleSubmit} style={s.formCard}>
        <div style={s.header}>
          <h2 style={s.title}>Welcome back</h2>
          <p style={s.subtitle}>Log in to CodeCollab</p>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        <div style={s.inputContainer}>
          <label style={s.label}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={s.input} required />
        </div>

        <div style={s.inputContainer}>
          <label style={s.label}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={s.input} required />
        </div>

        <button type="submit" style={s.button}>Log in</button>

        <p style={s.switchText}>
          No account? <Link to="/signup" style={s.link}>Sign up</Link>
        </p>
        <p style={s.switchText}>
          <Link to="/forgot-password" style={s.link}>Forgot password?</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
