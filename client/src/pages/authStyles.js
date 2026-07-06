export const authStyles = {
  fullscreenWrapper: {
    width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center',
    alignItems: 'center', backgroundColor: '#050505',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  formCard: {
    background: '#111111', border: '1px solid #222', padding: '40px',
    borderRadius: '16px', width: '100%', maxWidth: '400px', boxSizing: 'border-box'
  },
  header: { textAlign: 'center', marginBottom: '24px' },
  title: { color: '#ffffff', fontSize: '26px', fontWeight: '700', margin: '0 0 4px 0' },
  subtitle: { color: '#666', fontSize: '14px', margin: 0 },
  inputContainer: { marginBottom: '18px' },
  label: { display: 'block', color: '#999', fontSize: '13px', fontWeight: '500', marginBottom: '8px' },
  input: {
    width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #333',
    background: '#0a0a0a', color: '#fff', fontSize: '16px', outline: 'none', boxSizing: 'border-box'
  },
  button: {
    width: '100%', padding: '14px', backgroundColor: '#4caf50', color: '#ffffff',
    border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '8px'
  },
  errorBox: {
    background: '#2a0f0f', border: '1px solid #5c1f1f', color: '#ff8080',
    padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '18px'
  },
  switchText: { textAlign: 'center', color: '#666', fontSize: '13px', marginTop: '20px' },
  link: { color: '#4caf50', textDecoration: 'none', fontWeight: '600' }
};