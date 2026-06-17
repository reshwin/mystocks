import { Fragment } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Components', path: '/components' },
  { label: 'Purchase',   path: '/purchase' },
  { label: 'Suppliers',  path: '/suppliers' },
  { label: 'Stock Movement', path: '/stock', divider: true },
];
const styles = {
  logo: {
    width: "48px",
    height: "48px"
  }
};

export default function Sidebar({ isOpen, onClose, theme, onThemeToggle, user, onLogout }) {
  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="brand-block">
          <div className="logo">
            <img src="/icons/icon_128.png" alt="Logo" style={styles.logo}/>
          </div>
          <div>
            <h1>My Stock</h1>
            <p>DoomSquare</p>
          </div>
        </div>

        {user && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '8px',
            borderRadius: '6px',
            backgroundColor: 'var(--color-bg-secondary)',
            fontSize: '0.85rem'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '2px' }}>{user.name || 'User'}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{user.email}</div>
            {user.role && (
              <span style={{ display: 'inline-block', marginTop: '5px', padding: '1px 8px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
                {user.role}
              </span>
            )}
          </div>
        )}

        <nav className="nav-list">
          {navItems.map((item) => (
            <Fragment key={item.path}>
              {item.divider && <hr style={{ margin: '2px 12px 4px', border: 'none', borderTop: '1px solid var(--color-border)' }} />}
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                {item.label}
              </NavLink>
            </Fragment>
          ))}
        </nav>

        <div className="sidebar-note">
          <strong>DoomSquare</strong>
          <p>Stock management portal.</p>
        </div>

        <button className="btn btn-secondary theme-toggle" onClick={onThemeToggle}>
          {theme === 'light' ? '🌙 Dark mode' : '☀ Light mode'}
        </button>

        {user && (
          <button className="btn btn-secondary" onClick={onLogout} style={{ marginTop: '8px' }}>
            Sign out
          </button>
        )}
      </aside>
    </>
  );
}