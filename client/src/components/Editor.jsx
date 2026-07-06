import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { useAuth } from '../context/AuthContext';
import FileTabs from './FileTabs';
import PresenceBar from './PresenceBar';
import { languageFromFilename } from '../utils/fileLanguage';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:1234';
const CURSOR_COLORS = ['#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', '#2ecc71', '#3498db', '#1abc9c'];

const CodeEditor = ({ roomId }) => {
  const { user, token } = useAuth();

  const [ready, setReady] = useState(false);       // doc has synced at least once
  const [editorMounted, setEditorMounted] = useState(false);
  const [fileOrder, setFileOrder] = useState([]);   // filenames, in creation order
  const [activeFile, setActiveFile] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showOutput, setShowOutput] = useState(false);
  const [previewDoc, setPreviewDoc] = useState('');
  const [consoleLines, setConsoleLines] = useState([]);

  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const editorRef = useRef(null);
  const monacoNsRef = useRef(null);
  const modelsRef = useRef({});      // filename -> monaco.editor.ITextModel
  const bindingRef = useRef(null);   // current MonacoBinding, swapped on tab switch
  const typingTimeoutRef = useRef(null);
  const myColorRef = useRef(CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)]);

  // --- Connection + document setup: one Y.Doc per room, holding a Y.Map
  // of filename -> Y.Text, plus a Y.Array recording creation order for tabs.
  useEffect(() => {
    if (!roomId || !token) return;

    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(WS_URL, roomId, ydoc, { params: { token } });
    ydocRef.current = ydoc;
    providerRef.current = provider;

    const yFileOrder = ydoc.getArray('fileOrder');
    const yFiles = ydoc.getMap('files');

    provider.awareness.setLocalStateField('user', {
      name: user?.username || 'Anonymous', color: myColorRef.current, typing: false
    });

    const updatePresence = () => {
      const states = Array.from(provider.awareness.getStates().entries());
      setOnlineUsers(states.filter(([, s]) => s.user).map(([id, s]) => ({ clientId: id, ...s.user })));
    };
    provider.awareness.on('change', updatePresence);
    updatePresence();

    const syncFileList = () => {
      const names = yFileOrder.toArray();
      setFileOrder(names);
      setActiveFile((current) => (current && names.includes(current)) ? current : (names[0] || null));
    };
    yFileOrder.observe(syncFileList);

    // Only decide "is this room empty" AFTER the initial sync completes —
    // deciding before that would wrongly treat an existing room as new.
    const onSync = (isSynced) => {
      if (!isSynced) return;
      if (yFileOrder.length === 0) {
        ydoc.transact(() => {
          if (yFileOrder.length === 0) { // re-check inside the transaction
            yFileOrder.push(['index.js']);
            yFiles.set('index.js', new Y.Text());
          }
        });
      }
      syncFileList();
      setReady(true);
    };
    provider.on('connection-close', (event) => {
      if (event?.code === 4001) {
        alert('This room was deleted by its owner.');
        window.location.href = '/';
      }
    });

    provider.on('sync', onSync);

    return () => {
      provider.awareness.off('change', updatePresence);
      provider.off('sync', onSync);
      yFileOrder.unobserve(syncFileList);
      if (bindingRef.current) { bindingRef.current.destroy(); bindingRef.current = null; }
      Object.values(modelsRef.current).forEach((m) => m.dispose());
      modelsRef.current = {};
      provider.disconnect();
      ydoc.destroy();
      setReady(false);
      setEditorMounted(false);
    };
  }, [roomId, token]);

  // --- Bind Monaco to whichever file is active. Re-runs on tab switch,
  // creating a model per file the first time it's opened (separate undo
  // stacks per file) and swapping the MonacoBinding to that file's Y.Text.
  useEffect(() => {
    const editor = editorRef.current;
    const monacoNs = monacoNsRef.current;
    const ydoc = ydocRef.current;
    const provider = providerRef.current;
    if (!editor || !monacoNs || !ydoc || !provider || !activeFile || !ready) return;

    const yFiles = ydoc.getMap('files');
    const yText = yFiles.get(activeFile);
    if (!yText) return; // file metadata and content arrive in the same Yjs transaction, so this shouldn't linger

    let model = modelsRef.current[activeFile];
    if (!model) {
      model = monacoNs.editor.createModel('', languageFromFilename(activeFile));
      modelsRef.current[activeFile] = model;
    }

    if (bindingRef.current) bindingRef.current.destroy();
    editor.setModel(model);
    bindingRef.current = new MonacoBinding(yText, model, new Set([editor]), provider.awareness);

    return () => {
      if (bindingRef.current) { bindingRef.current.destroy(); bindingRef.current = null; }
    };
  }, [activeFile, ready, editorMounted]);

  const handleEditorDidMount = (editor, monacoNs) => {
    editorRef.current = editor;
    monacoNsRef.current = monacoNs;

    // Typing indicator — only fires on the false->true and true->false
    // transitions, deferred with setTimeout(0) so it never fires from
    // inside Monaco's own synchronous content-change handling (that
    // reentrancy is what previously crashed deltaDecorations).
    let isTyping = false;
    editor.onDidChangeModelContent(() => {
      const provider = providerRef.current;
      if (!provider) return;

      if (!isTyping) {
        isTyping = true;
        setTimeout(() => {
          provider.awareness.setLocalStateField('user', {
            name: user?.username || 'Anonymous', color: myColorRef.current, typing: true
          });
        }, 0);
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        isTyping = false;
        provider.awareness.setLocalStateField('user', {
          name: user?.username || 'Anonymous', color: myColorRef.current, typing: false
        });
      }, 1200);
    });

    setEditorMounted(true);
  };

  const createFile = () => {
    const name = window.prompt('New file name (e.g. index.html, style.css, script.js)');
    if (!name) return;

    const ydoc = ydocRef.current;
    if (!ydoc) return;
    const yFiles = ydoc.getMap('files');
    if (yFiles.has(name)) { alert('A file with that name already exists.'); return; }

    const yFileOrder = ydoc.getArray('fileOrder');
    ydoc.transact(() => {
      yFileOrder.push([name]);
      yFiles.set(name, new Y.Text());
    });
    setActiveFile(name);
  };

  const deleteFile = (name) => {
    if (fileOrder.length === 1) { alert("Can't delete the only file in a room."); return; }
    if (!window.confirm(`Delete ${name}? This can't be undone.`)) return;

    const ydoc = ydocRef.current;
    if (!ydoc) return;
    const yFileOrder = ydoc.getArray('fileOrder');
    const yFiles = ydoc.getMap('files');

    const idx = yFileOrder.toArray().indexOf(name);
    ydoc.transact(() => {
      if (idx !== -1) yFileOrder.delete(idx, 1);
      yFiles.delete(name);
    });

    // Clean up the orphaned Monaco model — otherwise it just leaks in memory
    if (modelsRef.current[name]) {
      modelsRef.current[name].dispose();
      delete modelsRef.current[name];
    }
  };

  const renameFile = (oldName, rawNewName) => {
    const newName = rawNewName.trim();
    if (!newName || newName === oldName) return;

    const ydoc = ydocRef.current;
    if (!ydoc) return;
    const yFileOrder = ydoc.getArray('fileOrder');
    const yFiles = ydoc.getMap('files');

    if (yFiles.has(newName)) { alert('A file with that name already exists.'); return; }

    // Yjs shared types can't be moved to a new map key once integrated, so
    // we create a fresh Y.Text with the same content and swap it in. This
    // briefly loses in-flight collaborative edit history for this one file,
    // which is an acceptable tradeoff for a rename (a rare, deliberate action).
    const oldText = yFiles.get(oldName);
    const content = oldText ? oldText.toString() : '';
    const newText = new Y.Text();
    newText.insert(0, content);

    const idx = yFileOrder.toArray().indexOf(oldName);
    ydoc.transact(() => {
      if (idx !== -1) { yFileOrder.delete(idx, 1); yFileOrder.insert(idx, [newName]); }
      yFiles.delete(oldName);
      yFiles.set(newName, newText);
    });

    if (modelsRef.current[oldName]) {
      modelsRef.current[oldName].dispose();
      delete modelsRef.current[oldName];
    }
    if (activeFile === oldName) setActiveFile(newName);
  };

  // --- Run: combine index.html + all .css + all .js into one document and
  // execute it inside a sandboxed iframe (allow-scripts only — no
  // same-origin access, so it can't touch this app's cookies/localStorage
  // or DOM even if a collaborator's code is malicious).
  const runCode = () => {
    const ydoc = ydocRef.current;
    if (!ydoc) return;
    const yFiles = ydoc.getMap('files');
    const getContent = (name) => yFiles.get(name)?.toString() || '';

    const htmlFile = fileOrder.find((f) => f.endsWith('.html'));
    const css = fileOrder.filter((f) => f.endsWith('.css')).map(getContent).join('\n');
    const js = fileOrder.filter((f) => f.endsWith('.js')).map(getContent).join('\n');
    const bodyHtml = htmlFile ? getContent(htmlFile) : '';

    // Console output happens inside the sandboxed iframe, not this window,
    // so it's relayed back via postMessage rather than a shared console object.
    const consoleRelay = `
      <script>
        const relay = (type, args) => window.parent.postMessage(
          { __consoleRelay: true, type, args: args.map(a => { try { return String(a); } catch { return '[unprintable]'; } }) }, '*'
        );
        console.log = (...a) => relay('log', a);
        console.error = (...a) => relay('error', a);
        window.onerror = (msg) => relay('error', [msg]);
      </script>`;

    const doc = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${bodyHtml}${consoleRelay}<script>${js}</script></body></html>`;

    setConsoleLines([]);
    setPreviewDoc(doc);
    setShowOutput(true);
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.__consoleRelay) {
        const prefix = e.data.type === 'error' ? '❌ ' : '';
        setConsoleLines((lines) => [...lines, prefix + e.data.args.join(' ')]);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e' }}>
      <div style={{ padding: '8px 20px', background: '#2d2d2d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <PresenceBar users={onlineUsers} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              navigator.clipboard.writeText(roomId);
              alert('Invite id copied — share it so others can join this room.');
            }}
            style={{ padding: '6px 16px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
          >
            📋 Copy invite
          </button>
          <button
            onClick={runCode}
            style={{ padding: '6px 16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ▶ Run
          </button>
        </div>
      </div>

      <FileTabs
        files={fileOrder}
        activeFile={activeFile}
        onSelect={setActiveFile}
        onCreate={createFile}
        onDelete={deleteFile}
        onRename={renameFile}
      />

      <div style={{ flex: 1, position: 'relative' }}>
        <Editor
          height="100%"
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{ fontSize: 14, automaticLayout: true, minimap: { enabled: false } }}
        />
      </div>

      {showOutput && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
          background: '#0a0a0a', borderTop: '2px solid #007acc', zIndex: 100,
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '5px 15px', background: '#252526', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#007acc', fontWeight: 'bold' }}>OUTPUT</span>
            <button onClick={() => setShowOutput(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '18px' }}>×</button>
          </div>
          <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
            <iframe
              title="sandbox-preview"
              sandbox="allow-scripts"
              srcDoc={previewDoc}
              style={{ flex: 1, border: 'none', background: '#fff' }}
            />
            <pre style={{ flex: 1, margin: 0, padding: '10px', color: '#fff', fontSize: '12px', overflow: 'auto', whiteSpace: 'pre-wrap', borderLeft: '1px solid #333' }}>
              {consoleLines.join('\n') || 'No console output yet.'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
