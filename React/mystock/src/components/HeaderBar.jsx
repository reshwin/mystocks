export default function HeaderBar({ onMenuClick, user }) {
  return (
    <header className="header-bar mobile-only">
      <button className="btn btn-secondary" onClick={onMenuClick}>Menu</button>
      {user && (
        <div style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          {user.name || user.email}
        </div>
      )}
    </header>
  );
}
