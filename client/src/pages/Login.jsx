import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Mail, Lock, ArrowRight, Eye, EyeOff, Shield, User } from 'lucide-react';
import Toast from '../components/Toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);

    if (!email || !password) {
      setToast({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      // Auto-route based on the user role returned from backend API
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'STORE_OWNER') {
        navigate('/owner');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setToast({ type: 'success', message: 'Demo credentials loaded' });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#ffffff'
      }}
    >
      {/* Main Pure White Login Card Block */}
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#0284c7',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
            }}
          >
            <Store size={28} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
            Sign in to access your StoreRating account
          </p>
        </div>

        {/* Single Unified Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '44px', background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '44px', paddingRight: '44px', background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', background: '#0284c7', color: '#ffffff', border: '1px solid #0284c7' }} disabled={loading}>
            {loading ? 'Authenticating...' : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Registration Link */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ fontWeight: '600', color: '#0284c7' }}>
            Register as Normal User
          </Link>
        </div>

        {/* Demo Accounts Card Box inside White Card */}
        <div
          style={{
            marginTop: '28px',
            padding: '16px',
            background: '#f0f9ff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #bae6fd',
            fontSize: '0.8rem'
          }}
        >
          <div style={{ fontWeight: '600', marginBottom: '10px', color: '#0f172a', letterSpacing: '0.02em', textTransform: 'uppercase', fontSize: '0.72rem' }}>
            Demo Logins (Click to Auto-fill):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@storerating.com', 'Admin@12345!')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: '#ffffff',
                border: '1px solid #bae6fd',
                borderRadius: 'var(--radius-sm)',
                color: '#0f172a',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} color="#0284c7" />
                <span style={{ fontWeight: '600' }}>Admin</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>admin@storerating.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('owner.marcus@storerating.com', 'Owner@12345!')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: '#ffffff',
                border: '1px solid #bae6fd',
                borderRadius: 'var(--radius-sm)',
                color: '#0f172a',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Store size={14} color="#0284c7" />
                <span style={{ fontWeight: '600' }}>Store Owner</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>owner.marcus@storerating.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('eleanor.vance@storerating.com', 'User@12345!')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: '#ffffff',
                border: '1px solid #bae6fd',
                borderRadius: 'var(--radius-sm)',
                color: '#0f172a',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="#0284c7" />
                <span style={{ fontWeight: '600' }}>Normal User</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>eleanor.vance@storerating.com</span>
            </button>
          </div>
        </div>

      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
