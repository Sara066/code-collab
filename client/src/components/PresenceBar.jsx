import React from 'react';

// Avatar row: initials bubble per online user (from Yjs Awareness),
// colored to match their cursor color, pulsing while actively typing.
const PresenceBar = ({ users }) => {
  if (users.length === 0) return <div />;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {users.map((u, i) => (
        <div
          key={u.clientId}
          title={u.typing ? `${u.name} is typing…` : u.name}
          style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: u.color, color: '#111', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '700', border: '2px solid #2d2d2d',
            marginLeft: i === 0 ? 0 : '-8px', position: 'relative',
            boxShadow: u.typing ? `0 0 0 2px ${u.color}` : 'none',
            transition: 'box-shadow 0.2s'
          }}
        >
          {u.name?.slice(0, 2).toUpperCase() || '??'}
          {u.typing && (
            <span style={{
              position: 'absolute', bottom: '-2px', right: '-2px',
              width: '9px', height: '9px', borderRadius: '50%',
              background: '#4caf50', border: '2px solid #2d2d2d'
            }} />
          )}
        </div>
      ))}
      <span style={{ marginLeft: '16px', fontSize: '12px', color: '#888' }}>
        {users.length} online
      </span>
    </div>
  );
};

export default PresenceBar;
