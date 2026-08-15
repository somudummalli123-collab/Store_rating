import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Store, User, Mail, Lock, MapPin, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Toast from '../components/Toast';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const validateForm = () => {
    const errs = {};
    const { name, email, address, password, confirmPassword } = formData;

    if (!name || name.trim().length < 20 || name.trim().length > 60) {
      errs.name = 'Name must be between 20 and 60 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      errs.email = 'Valid email address is required';
    }

    if (!address || address.trim().length === 0) {
      errs.address = 'Address is required';
    } else if (address.trim().length > 400) {
      errs.address = 'Address cannot exceed 400 characters';
    }

    if (!password || password.length < 8 || password.length > 16) {
      errs.password = 'Password must be 8-16 characters';
    } else if (!/[A-Z]/.test(password)) {
      errs.password = 'Password must include at least one uppercase letter';
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errs.password = 'Password must include at least one special character';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...signupPayload } = formData;
      await signup(signupPayload);
      setToast({ type: 'success', message: 'Registration successful! Redirecting to login...' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const serverErrs = err.response?.data?.errors;
      if (serverErrs) {
        setErrors(serverErrs);
      }
      const msg = err.response?.data?.message || 'Registration failed. Please check inputs.';
      setToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#09090b',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
            }}
          >
            <User size={30} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Register as a Normal User to browse & rate stores
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Full Name</label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {formData.name.length}/60 (Min 20)
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                name="name"
                className={`form-input ${errors.name ? 'is-invalid' : ''}`}
                style={{ paddingLeft: '44px' }}
                placeholder="e.g. Christopher Robin William User"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="email"
                name="email"
                className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                style={{ paddingLeft: '44px' }}
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>

          {/* Address Field */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Address</label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {formData.address.length}/400
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-dim)' }} />
              <textarea
                name="address"
                rows={2}
                className={`form-input ${errors.address ? 'is-invalid' : ''}`}
                style={{ paddingLeft: '44px' }}
                placeholder="Full residential or postal address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            {errors.address && <div className="error-text">{errors.address}</div>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`form-input ${errors.password ? 'is-invalid' : ''}`}
                style={{ paddingLeft: '44px', paddingRight: '44px' }}
                placeholder="8-16 chars, 1+ uppercase, 1+ special"
                value={formData.password}
                onChange={handleChange}
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
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Must be 8-16 characters with at least 1 uppercase & 1 special character
            </span>
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                style={{ paddingLeft: '44px', paddingRight: '44px' }}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
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
            {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
          </div>

          {/* Show/Hide Password Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              id="showPasswordCheckbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="showPasswordCheckbox" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
              Show Passwords
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
            {loading ? 'Creating Account...' : (
              <>
                Register Account <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: '600', color: 'var(--primary)' }}>
            Sign In
          </Link>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
