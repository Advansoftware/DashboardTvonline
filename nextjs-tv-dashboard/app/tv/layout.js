export default function TVLayout({ children }) {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#000'
    }}>
      {children}
    </div>
  );
}