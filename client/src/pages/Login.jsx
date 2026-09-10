import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card slide-up">
        <div className="auth-logo">
          <img src="/logo.png" alt="Nova" style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-lg)', objectFit: 'contain' }} />
          <span className="auth-logo-text">NOVA</span>
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
            id="login-btn"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></span>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </div>

        <div style={{ marginTop: '20px', padding: '15px', background: 'var(--primary-100)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--primary-300)', textAlign: 'center', fontSize: '13px' }}>
          <strong style={{ color: 'var(--primary-700)' }}>Demo Credentials</strong>
          <div style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>Email: <code style={{ background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px', userSelect: 'all', color: 'var(--text-primary)' }}>demo@nova.com</code></div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Password: <code style={{ background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px', userSelect: 'all', color: 'var(--text-primary)' }}>demo123</code></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
