import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import CodeEditor from './components/Editor';

function App() {
  // 1. Manage the list of files in state
  const [files, setFiles] = useState([
    { id: 'file-main-js', name: 'main.js', language: 'javascript' },
  ]);
/*const [files, setFiles] = useState([
  { id: 'shared-room-123', name: 'main.js', language: 'javascript' },
]);*/
// App.jsx
/*const [files, setFiles] = useState([
  { id: 'shared-main', name: 'main.js', language: 'javascript' },
  { id: 'shared-style', name: 'style.css', language: 'css' }
]);*/
// App.jsx
/*const [files, setFiles] = useState([
  { id: 'project-v1-main', name: 'main.js', language: 'javascript' },
  { id: 'project-v1-style', name: 'style.css', language: 'css' },
  { id: 'project-v1-home', name: 'home.html', language: 'html' }
]);*/

  // 2. Track which file is currently open
  const [activeFile, setActiveFile] = useState(files[0]);

  // 3. Logic to add a new file to the list
  const addNewFile = (fileName) => {
    const extension = fileName.split('.').pop();
    
    // Simple mapping for syntax highlighting
    const langMap = { 
      js: 'javascript', 
      py: 'python', 
      css: 'css', 
      html: 'html', 
      json: 'json' 
    };
    
    const newFile = {
      id: `file-${Date.now()}`, // Unique ID for the Yjs Room
      name: fileName,
      language: langMap[extension] || 'plaintext'
    };

    setFiles(prev => [...prev, newFile]);
    setActiveFile(newFile); // Switch to the new file immediately
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      backgroundColor: '#1e1e1e', 
      color: '#fff',
      overflow: 'hidden' 
    }}>
      
      {/* Sidebar Component */}
      <Sidebar 
        files={files} 
        activeFileId={activeFile?.id} 
        setActiveFile={setActiveFile} 
        onAddFile={addNewFile} 
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeFile ? (
          <>
            <header style={{ 
              padding: '12px 20px', 
              background: '#252526', 
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <div style={{ color: '#9cdcfe', fontWeight: 'bold' }}>
                {activeFile.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                Room ID: {activeFile.id}
              </div>
            </header>

            <main style={{ flex: 1, position: 'relative' }}>
              {/* IMPORTANT: The 'key' ensures Yjs resets for the new room */}
              <CodeEditor 
                key={activeFile.id} 
                roomId={activeFile.id} 
                language={activeFile.language} 
              />
            </main>
          </>
        ) : (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#555' 
          }}>
            <h2>Create a file to start coding</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;