import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authStyles as s } from './authStyles';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1234';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setMessage(data.message);
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div style={s.fullscreenWrapper}>
      <form onSubmit={handleSubmit} style={s.formCard}>
        <div style={s.header}>
          <h2 style={s.title}>Reset password</h2>
          <p style={s.subtitle}>We'll email you a reset link</p>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}
        {submitted ? (
          <p style={{ color: '#9cdcfe', fontSize: '14px', textAlign: 'center' }}>{message}</p>
        ) : (
          <>
            <div style={s.inputContainer}>
              <label style={s.label}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={s.input} required />
            </div>
            <button type="submit" style={s.button}>Send reset link</button>
          </>
        )}

        <p style={s.switchText}>
          <Link to="/login" style={s.link}>Back to login</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
