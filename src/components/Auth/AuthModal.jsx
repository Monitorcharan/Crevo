import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../../context/useAuth.js';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }) {
  const shouldReduceMotion = useReducedMotion();
  const { signIn, signUp, isConfigured } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('creator'); // 'creator' | 'brand'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn({ email, password });
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        await signUp({ email, password, role, displayName });
        setSuccessMsg(
          isConfigured
            ? 'Account created! Please check your email to confirm registration.'
            : 'Demo account registered and signed in!'
        );
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="auth-modal-backdrop" onClick={onClose} aria-hidden="true" />

      <div
        className="auth-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <motion.div
          className="auth-modal"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            className="auth-modal__close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>

          {/* Mode Switcher Tabs */}
          <div className="auth-modal__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signin'}
              className={`auth-modal__tab ${mode === 'signin' ? 'auth-modal__tab--active' : ''}`}
              onClick={() => {
                setMode('signin');
                setError('');
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              className={`auth-modal__tab ${mode === 'signup' ? 'auth-modal__tab--active' : ''}`}
              onClick={() => {
                setMode('signup');
                setError('');
              }}
            >
              Create Account
            </button>
          </div>

          {/* Service Configuration Badge */}
          <div className="auth-modal__mode-banner" role="status">
            <span
              className={`auth-modal__mode-dot ${
                isConfigured ? 'auth-modal__mode-dot--live' : 'auth-modal__mode-dot--demo'
              }`}
              aria-hidden="true"
            />
            <span className="auth-modal__mode-text">
              {isConfigured
                ? 'Connected to live Supabase Auth instance'
                : 'Demo Auth Sandbox Mode — Full login/role testing active'}
            </span>
          </div>

          <h2 id="auth-modal-title" className="auth-modal__title">
            {mode === 'signin' ? 'Welcome to Crevo' : 'Join the AI Creative Frontier'}
          </h2>
          <p className="auth-modal__subtext">
            {mode === 'signin'
              ? 'Access your creative commissions, briefs, and generative portfolio pipeline.'
              : 'Connect with leading brands and deploy authentic generative productions.'}
          </p>

          {error && (
            <div className="auth-modal__alert auth-modal__alert--error" role="alert">
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div className="auth-modal__alert auth-modal__alert--success" role="status">
              ✓ {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-modal__form">
            {mode === 'signup' && (
              <>
                {/* Role Selector */}
                <div className="auth-modal__field">
                  <label className="auth-modal__label">Select Your Platform Role</label>
                  <div className="auth-modal__role-selector">
                    <label
                      className={`auth-modal__role-card ${
                        role === 'creator' ? 'auth-modal__role-card--selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="creator"
                        checked={role === 'creator'}
                        onChange={() => setRole('creator')}
                        className="auth-modal__radio-input"
                      />
                      <div className="auth-modal__role-content">
                        <strong>AI Creator</strong>
                        <span>Director, Animator, or Artist publishing AI work</span>
                      </div>
                    </label>

                    <label
                      className={`auth-modal__role-card ${
                        role === 'brand' ? 'auth-modal__role-card--selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="brand"
                        checked={role === 'brand'}
                        onChange={() => setRole('brand')}
                        className="auth-modal__radio-input"
                      />
                      <div className="auth-modal__role-content">
                        <strong>Brand / Agency</strong>
                        <span>Commissioning AI creators and publishing briefs</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Display Name */}
                <div className="auth-modal__field">
                  <label className="auth-modal__label">Display Name / Studio Name</label>
                  <input
                    type="text"
                    required
                    className="auth-modal__input"
                    placeholder="e.g. Elena Vance"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div className="auth-modal__field">
              <label className="auth-modal__label">Email Address</label>
              <input
                type="email"
                required
                className="auth-modal__input"
                placeholder="name@crevo.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="auth-modal__field">
              <label className="auth-modal__label">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="auth-modal__input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="button button--primary auth-modal__submit-btn"
              disabled={loading}
            >
              {loading
                ? 'Processing...'
                : mode === 'signin'
                ? 'Sign In to Dashboard'
                : 'Complete Registration'}
            </button>
          </form>

          {/* Demo tip */}
          {!isConfigured && mode === 'signin' && (
            <p className="auth-modal__demo-hint">
              💡 <strong>Quick Demo Tip:</strong> You can enter any email (e.g. <code>director@crevo.ai</code>) and password to test live creator sessions.
            </p>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
