import Editor from '@monaco-editor/react';

export default function CodeEditor({ code, onCodeChange }) {
  return (
    <div style={{ flex: 1, height: '100%' }}>
      <Editor
        height="100vh"
        theme="vs-dark"
        defaultLanguage="javascript"
        value={code}
        onChange={(newValue) => onCodeChange(newValue)}
        options={{
          fontSize: 16,
          minimap: { enabled: false },
          automaticLayout: true, // Resizes editor if window size changes
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}