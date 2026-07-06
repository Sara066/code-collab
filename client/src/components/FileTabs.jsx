import React, { useState } from 'react';

// Presentational tab bar. File state (Yjs, models) lives in Editor.jsx —
// this only renders it and reports user actions upward.
const FileTabs = ({ files, activeFile, onSelect, onCreate, onDelete, onRename }) => {
  const [renamingFile, setRenamingFile] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const startRename = (name) => {
    setRenamingFile(name);
    setRenameValue(name);
  };

  const commitRename = () => {
    if (renamingFile) onRename(renamingFile, renameValue);
    setRenamingFile(null);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', background: '#252526',
      borderBottom: '1px solid #333', overflowX: 'auto'
    }}>
      {files.map((name) => (
        <div
          key={name}
          onClick={() => onSelect(name)}
          onDoubleClick={() => startRename(name)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 10px 8px 16px', cursor: 'pointer', fontSize: '13px',
            color: name === activeFile ? '#fff' : '#888',
            background: name === activeFile ? '#1e1e1e' : 'transparent',
            borderRight: '1px solid #333',
            borderTop: name === activeFile ? '2px solid #4caf50' : '2px solid transparent',
            whiteSpace: 'nowrap'
          }}
        >
          {renamingFile === name ? (
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingFile(null); }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#0a0a0a', border: '1px solid #4caf50', color: '#fff', fontSize: '13px', padding: '2px 6px', outline: 'none', width: '110px' }}
            />
          ) : (
            <span title="Double-click to rename">{name}</span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(name); }}
            title={`Delete ${name}`}
            style={{ background: 'none', border: 'none', color: '#666', fontSize: '14px', cursor: 'pointer', padding: 0, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={onCreate}
        title="New file"
        style={{ background: 'none', border: 'none', color: '#888', fontSize: '16px', padding: '4px 12px', cursor: 'pointer' }}
      >
        +
      </button>
    </div>
  );
};

export default FileTabs;
