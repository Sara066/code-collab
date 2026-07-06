import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout, authFetch } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadRooms = async () => {
    try {
      const data = await authFetch('/api/rooms');
      setRooms(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { loadRooms(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newRoomName) return;
    try {
      const room = await authFetch('/api/rooms', {
        method: 'POST',
        body: JSON.stringify({ name: newRoomName })
      });
      setNewRoomName('');
      navigate(`/editor/${room.roomId}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinId) return;
    try {
      const room = await authFetch(`/api/rooms/${joinId.trim()}/join`, { method: 'POST' });
      navigate(`/editor/${room.roomId}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopyInvite = (e, roomId) => {
    e.stopPropagation();
    navigator.clipboard.writeText(roomId);
    alert('Invite id copied — share it so others can join this room.');
  };

  const handleRename = async (e, room) => {
    e.stopPropagation();
    const newName = window.prompt('Rename room', room.name);
    if (!newName?.trim() || newName === room.name) return;
    try {
      await authFetch(`/api/rooms/${room.roomId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: newName.trim() })
      });
      loadRooms();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (e, room) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${room.name}"? This can't be undone, and removes it for every collaborator.`)) return;
    try {
      await authFetch(`/api/rooms/${room.roomId}`, { method: 'DELETE' });
      loadRooms();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.brand}>CodeCollab</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#9cdcfe' }}>{user?.username}</span>
          <button onClick={logout} style={styles.logoutBtn}>Log out</button>
        </div>
      </header>

      <main style={styles.main}>
        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.actionsRow}>
          <form onSubmit={handleCreate} style={styles.inlineForm}>
            <input
              placeholder="New room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.primaryBtn}>Create room</button>
          </form>

          <form onSubmit={handleJoin} style={styles.inlineForm}>
            <input
              placeholder="Paste invite id to join"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.secondaryBtn}>Join room</button>
          </form>
        </div>

        <h3 style={styles.sectionTitle}>Your rooms</h3>
        {rooms.length === 0 && <p style={{ color: '#666' }}>No rooms yet — create one above.</p>}
        <div style={styles.roomGrid}>
          {rooms.map((room) => {
            const isOwner = room.owner === user?.id;
            return (
              <div key={room.roomId} style={styles.roomCard} onClick={() => navigate(`/editor/${room.roomId}`)}>
                <div style={styles.roomName}>{room.name}</div>
                <div style={styles.roomMeta}>Updated {new Date(room.lastUpdated).toLocaleString()}</div>
                <div style={styles.roomId}>Invite id: {room.roomId}</div>
                <div style={styles.cardActions}>
                  <button onClick={(e) => handleCopyInvite(e, room.roomId)} style={styles.cardBtn} title="Copy invite id">📋 Copy</button>
                  {isOwner && (
                    <>
                      <button onClick={(e) => handleRename(e, room)} style={styles.cardBtn} title="Rename room">✏️ Rename</button>
                      <button onClick={(e) => handleDelete(e, room)} style={{ ...styles.cardBtn, color: '#ff8080' }} title="Delete room">🗑️ Delete</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: '#050505', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid #222' },
  brand: { color: '#4caf50', fontWeight: '700', fontSize: '18px' },
  logoutBtn: { background: 'none', border: '1px solid #333', color: '#ccc', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' },
  main: { padding: '32px', maxWidth: '900px', margin: '0 auto' },
  errorBox: { background: '#2a0f0f', border: '1px solid #5c1f1f', color: '#ff8080', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px' },
  actionsRow: { display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '32px' },
  inlineForm: { display: 'flex', gap: '10px', flex: 1, minWidth: '260px' },
  input: { flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', outline: 'none' },
  primaryBtn: { padding: '10px 18px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  secondaryBtn: { padding: '10px 18px', background: '#222', color: '#fff', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  sectionTitle: { color: '#999', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' },
  roomGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' },
  roomCard: { background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '18px', cursor: 'pointer' },
  roomName: { fontSize: '16px', fontWeight: '600', marginBottom: '6px' },
  roomMeta: { fontSize: '12px', color: '#666', marginBottom: '10px' },
  roomId: { fontSize: '11px', color: '#4caf50', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '10px' },
  cardActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  cardBtn: { background: 'none', border: '1px solid #333', color: '#ccc', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }
};

export default Dashboard;
