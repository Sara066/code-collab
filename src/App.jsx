import { useState } from 'react';
import Sidebar from './components/Sidebar';
import CodeEditor from './components/Editor';

function App() {
  // PHASE 1 OBJECTIVE: Capture the code reliably in state
  const [code, setCode] = useState('// Welcome to your Real-time Editor\nconsole.log("Hello Phase 1!");');
console.log(code)
  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden',
      backgroundColor: '#1e1e1e' 
    }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Navbar area - we'll keep it empty for now to focus on the editor */}
        <CodeEditor code={code} onCodeChange={setCode} />
      </div>
    </div>
  );
}

export default App;