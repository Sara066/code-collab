import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

const CodeEditor = ({ roomId, language }) => {
  const editorRef = useRef(null);
  const [output, setOutput] = useState('');
  const [showConsole, setShowConsole] = useState(false);
  const [isHtmlPreview, setIsHtmlPreview] = useState(false);

  // --- 1. RESET UI ON SWITCH ---
  useEffect(() => {
    setShowConsole(false);
    setOutput('');
    setIsHtmlPreview(false);
  }, [roomId]);

  // --- 2. COLLABORATION LOGIC ---
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    // IMPORTANT: Clear the editor's local memory before connecting Yjs
    // This prevents "ghost" code from sticking around during the switch.
    editor.setValue(""); 

    const ydoc = new Y.Doc();
    
    // We use a "v4" prefix to force the server to create BRAND NEW rooms
    // that have no history of the previous "merging" bug.
    const provider = new WebsocketProvider(
      'ws://localhost:1234', 
      `v4-collab-room-${roomId}`, 
      ydoc
    );

    // Set Cursor Identity
    const colors = ['#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', '#2ecc71'];
    provider.awareness.setLocalStateField('user', {
      name: 'User ' + Math.floor(Math.random() * 100),
      color: colors[Math.floor(Math.random() * colors.length)]
    });

    const yText = ydoc.getText('monaco');
    const binding = new MonacoBinding(
      yText, 
      editor.getModel(), 
      new Set([editor]), 
      provider.awareness
    );

    // CLEANUP: Kill the old connection before the next one starts
    return () => {
      binding.destroy();
      provider.disconnect();
      ydoc.destroy();
    };
  };

  // --- 3. EXECUTION LOGIC ---
  const runCode = () => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();
    setShowConsole(true);

    if (language === 'html') {
      setIsHtmlPreview(true);
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setOutput(url); 
    } else {
      setIsHtmlPreview(false);
      setOutput('Running...');
      let logs = [];
      const mockConsole = {
        log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        error: (...args) => logs.push('❌ ' + args.join(' '))
      };

      try {
        const fn = new Function('console', code);
        fn(mockConsole);
        setOutput(logs.length > 0 ? logs.join('\n') : '✅ Executed successfully.');
      } catch (err) {
        setOutput('⚠️ ERROR: ' + err.message);
      }
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e', position: 'relative' }}>
      
      {/* Run Bar */}
      <div style={{ padding: '8px 20px', background: '#2d2d2d', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid #333' }}>
        <button 
          onClick={runCode}
          style={{ padding: '6px 16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ▶ Run {language?.toUpperCase()}
        </button>
      </div>

      {/* Monaco */}
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          language={language || 'javascript'}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{ fontSize: 14, automaticLayout: true, minimap: { enabled: false } }}
        />
      </div>

      {/* Terminal / Preview */}
      {showConsole && (
        <div style={{ 
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', 
          background: isHtmlPreview ? '#fff' : '#0a0a0a', 
          borderTop: '2px solid #007acc', zIndex: 9999, display: 'flex', flexDirection: 'column' 
        }}>
          <div style={{ padding: '5px 15px', background: '#252526', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#007acc', fontWeight: 'bold' }}>
              {isHtmlPreview ? 'BROWSER PREVIEW' : 'TERMINAL'}
            </span>
            <button onClick={() => setShowConsole(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '20px' }}>×</button>
          </div>
          
          <div style={{ flex: 1, overflow: 'auto' }}>
            {isHtmlPreview ? (
              <iframe src={output} title="preview" style={{ width: '100%', height: '100%', border: 'none', background: 'white' }} />
            ) : (
              <pre style={{ margin: 0, padding: '15px', whiteSpace: 'pre-wrap', color: '#fff', fontFamily: 'monospace', fontSize: '13px' }}>
                {output}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;