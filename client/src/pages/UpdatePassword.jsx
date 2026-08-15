import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { KeyRound, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function UpdatePassword() {
  const { updatePassword, user } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setToast(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 16) {
      setError('Password must be between 8 and 16 characters');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must include at least one uppercase letter');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setError('Password must include at least one special character');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setToast({ type: 'success', message: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        if (user?.role === 'ADMIN') navigate('/admin');
        else if (user?.role === 'STORE_OWNER') navigate('/owner');
        else navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password';
      setError(msg);
      setToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div style={{ maxWidth: '480px', margin: '40px auto', padding: '0 20px' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '20px' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <KeyRound size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Update Password</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Change your account password securely
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="8-16 chars, 1+ uppercase, 1+ special"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <div className="error-text" style={{ marginBottom: '16px' }}>{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
              {loading ? 'Updating Password...' : (
                <>
                  <CheckCircle2 size={18} /> Update Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
