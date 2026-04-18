import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

const CodeEditor = ({ roomId, language }) => {
  const [editorInstance, setEditorInstance] = useState(null);
  const [output, setOutput] = useState('');
  const [showConsole, setShowConsole] = useState(false);

  useEffect(() => {
    // We only start syncing once the editor is ready AND we have a roomId
    if (!editorInstance || !roomId) return;

    const username = sessionStorage.getItem('username') || 'Anonymous';
    const ydoc = new Y.Doc();
    
    // We add a unique prefix to ensure the server treats this as a distinct room
    const provider = new WebsocketProvider(
      'ws://localhost:1234', 
      `room-${roomId}`, 
      ydoc
    );

    const yText = ydoc.getText('monaco');

    // Awareness for cursors
    const colors = ['#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', '#2ecc71'];
    provider.awareness.setLocalStateField('user', {
      name: username,
      color: colors[Math.floor(Math.random() * colors.length)]
    });

    // Bind Yjs to Monaco
    const binding = new MonacoBinding(
      yText, 
      editorInstance.getModel(), 
      new Set([editorInstance]), 
      provider.awareness
    );

    console.log(`Connected to: room-${roomId}`);

    // Cleanup: Kills the connection when you switch rooms or leave
    return () => {
      binding.destroy();
      provider.disconnect();
      ydoc.destroy();
      console.log("Disconnected from room");
    };
  }, [editorInstance, roomId]); // Runs when editor is ready OR roomId changes

  const handleEditorDidMount = (editor) => {
    setEditorInstance(editor);
  };

  const runCode = () => {
    if (!editorInstance) return;
    const code = editorInstance.getValue();
    setShowConsole(true);
    let logs = [];
    const mockConsole = {
      log: (...args) => logs.push(args.join(' ')),
      error: (...args) => logs.push('❌ ' + args.join(' '))
    };
    try {
      new Function('console', code)(mockConsole);
      setOutput(logs.join('\n') || 'Executed successfully.');
    } catch (err) {
      setOutput('⚠️ ' + err.message);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e' }}>
      <div style={{ padding: '8px 20px', background: '#2d2d2d', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={runCode} style={{ padding: '6px 16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          ▶ Run JavaScript
        </button>
      </div>

      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          language="javascript"
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{ fontSize: 14, automaticLayout: true, minimap: { enabled: false } }}
        />
      </div>

      {showConsole && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: '#0a0a0a', borderTop: '2px solid #007acc', zIndex: 100 }}>
          <div style={{ padding: '5px 15px', background: '#252526', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#007acc', fontWeight: 'bold' }}>CONSOLE</span>
            <button onClick={() => setShowConsole(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '18px' }}>×</button>
          </div>
          <pre style={{ margin: 0, padding: '15px', color: '#fff', fontSize: '13px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>{output}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;