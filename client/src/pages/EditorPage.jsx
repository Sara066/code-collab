import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CodeEditor from '../components/Editor';
import { useAuth } from '../context/AuthContext';

const EditorPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: '#1e1e1e' }}>
      <header style={{
        padding: '10px 20px', background: '#252526', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ color: '#4caf50', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/')}>
            🏠 Dashboard
          </span>
          <span style={{ color: '#888' }}>
            Room: <b style={{ color: '#fff' }}>{roomId}</b>
          </span>
        </div>
        <div style={{ color: '#9cdcfe' }}>User: <b>{user?.username}</b></div>
      </header>

      <main style={{ flex: 1, position: 'relative' }}>
        {/* key={roomId} re-mounts the editor (and its WS connection) when switching rooms */}
        <CodeEditor key={roomId} roomId={roomId} />
      </main>
    </div>
  );
};

export default EditorPage;
