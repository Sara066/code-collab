import React, { useState } from 'react';

const Sidebar = ({ files, activeFileId, setActiveFile, onAddFile }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleCreate = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onAddFile(inputValue.trim());
      setInputValue('');
      setIsCreating(false);
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setInputValue('');
    }
  };

  return (
    <div style={{ 
      width: '240px', 
      backgroundColor: '#252526', 
      borderRight: '1px solid #333', 
      color: '#ccc',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Header with Add Button */}
      <div style={{ 
        padding: '15px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #333'
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#888' }}>EXPLORER</span>
        <button 
          onClick={() => setIsCreating(true)}
          title="New File"
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#fff', 
            cursor: 'pointer', 
            fontSize: '1.2rem',
            lineHeight: '1'
          }}
        >
          +
        </button>
      </div>

      {/* New File Input Field */}
      {isCreating && (
        <div style={{ padding: '10px 15px' }}>
          <input 
            autoFocus
            style={{ 
              width: '100%', 
              background: '#3c3c3c', 
              border: '1px solid #007acc', 
              color: '#fff', 
              padding: '4px 8px',
              outline: 'none',
              fontSize: '0.9rem'
            }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleCreate}
            onBlur={() => {
              if (!inputValue) setIsCreating(false);
            }}
            placeholder="filename.js"
          />
          <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>Press Enter to save</div>
        </div>
      )}

      {/* File List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: '10px' }}>
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => setActiveFile(file)}
            style={{
              padding: '8px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: activeFileId === file.id ? '#37373d' : 'transparent',
              color: activeFileId === file.id ? '#fff' : '#ccc',
              fontSize: '0.9rem',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => {
              if (activeFileId !== file.id) e.currentTarget.style.backgroundColor = '#2a2d2e';
            }}
            onMouseOut={(e) => {
              if (activeFileId !== file.id) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span style={{ 
              color: file.name.endsWith('.js') ? '#f1e05a' : 
                     file.name.endsWith('.css') ? '#569cd6' : 
                     file.name.endsWith('.html') ? '#e34c26' : '#888' 
            }}>
              📄
            </span>
            {file.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;