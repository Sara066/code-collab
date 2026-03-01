export default function Sidebar() {
  return (
    <div style={{ 
      width: '240px', 
      backgroundColor: '#1e1e1e', 
      color: '#858585', 
      display: 'flex', 
      flexDirection: 'column',
      borderRight: '1px solid #333',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ padding: '15px', fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>EXPLORER</div>
      <div style={{ padding: '10px 20px', backgroundColor: '#37373d', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>
        📄 main.js
      </div>
    </div>
  );
}