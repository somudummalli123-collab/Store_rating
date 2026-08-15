import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import RoleBadge from './RoleBadge';
import { LogOut, KeyRound, Store } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e4e4e7',
        padding: '14px 28px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
          }}
        >
          <Store size={22} color="#ffffff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', lineHeight: 1.1, color: '#0f172a', letterSpacing: '-0.02em' }}>StoreRating</h2>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Enterprise Platform</span>
        </div>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>{user.name}</span>
            <RoleBadge role={user.role} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/update-password" className="btn btn-secondary btn-sm">
              <KeyRound size={15} /> Password
            </Link>
            <button onClick={handleLogout} className="btn btn-danger btn-sm">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
