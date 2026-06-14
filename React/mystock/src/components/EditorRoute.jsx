import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guards create/edit routes: only admin and manager may enter. Everyone
// else is bounced back to the list page (the real enforcement is the API,
// which rejects writes from other roles).
export default function EditorRoute({ children, redirectTo = '/' }) {
  const { canEdit, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.1rem',
        color: 'var(--color-text-muted)'
      }}>
        Loading...
      </div>
    );
  }

  if (!canEdit) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
