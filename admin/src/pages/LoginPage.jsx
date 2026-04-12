/**
 * Login Page — WaselX Admin
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Eye, EyeOff, Loader } from 'lucide-react';
import { authAPI } from '../services/api.js';
import logo from '../assets/logo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authAPI.login(form);
      if (data.data.user.role !== 'admin') {
        setError('Access denied. Admin account required.');
        return;
      }
      localStorage.setItem('waselx_admin_token', data.data.accessToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <img src={logo} alt="WaselX" style={{ height: '80px', marginBottom: '24px' }} />
          <div className="login-logo-sub">Admin Dashboard — Logistics Platform UAE</div>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', borderLeft: '3px solid #ef4444' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">Email Address</label>
            <input
              id="admin-email"
              type="email"
              className="form-input"
              placeholder="admin@waselx.com"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                style={{ paddingRight: '44px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', height: '44px', marginTop: '8px' }} disabled={loading}>
            {loading ? <Loader size={16} className="spinning" style={{ animation: 'spin 0.7s linear infinite' }} /> : null}
            {loading ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#94a3b8' }}>
          WaselX © 2024 · Logistics Marketplace UAE
        </div>
      </div>
    </div>
  );
}
