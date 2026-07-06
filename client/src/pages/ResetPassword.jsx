import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authStyles as s } from './authStyles';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1234';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    if (!token) {
      setError('Missing reset token — use the link from your email');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={s.fullscreenWrapper}>
      <form onSubmit={handleSubmit} style={s.formCard}>
        <div style={s.header}>
          <h2 style={s.title}>Set a new password</h2>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}
        {success ? (
          <p style={{ color: '#9cdcfe', fontSize: '14px', textAlign: 'center' }}>
            Password updated — redirecting to login…
          </p>
        ) : (
          <>
            <div style={s.inputContainer}>
              <label style={s.label}>New password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={s.input} required minLength={8} />
            </div>
            <div style={s.inputContainer}>
              <label style={s.label}>Confirm password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={s.input} required minLength={8} />
            </div>
            <button type="submit" style={s.button}>Update password</button>
          </>
        )}

        <p style={s.switchText}>
          <Link to="/login" style={s.link}>Back to login</Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;
