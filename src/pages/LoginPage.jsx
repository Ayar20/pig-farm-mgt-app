import React, { useState } from 'react';
import { authClient } from '../auth';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const PigIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 64 64" fill="currentColor">
    <ellipse cx="32" cy="36" rx="20" ry="16"/>
    <ellipse cx="18" cy="28" rx="8" ry="6"/>
    <ellipse cx="46" cy="28" rx="8" ry="6"/>
    <circle cx="28" cy="38" r="3" fill="white" opacity="0.6"/>
    <circle cx="36" cy="38" r="3" fill="white" opacity="0.6"/>
    <circle cx="28.5" cy="38.5" r="1.2" fill="#1e293b"/>
    <circle cx="36.5" cy="38.5" r="1.2" fill="#1e293b"/>
    <ellipse cx="32" cy="42" rx="5" ry="3.5" fill="rgba(255,255,255,0.2)"/>
    <circle cx="30.5" cy="42" r="1" fill="#1e293b"/>
    <circle cx="33.5" cy="42" r="1" fill="#1e293b"/>
    <path d="M50 24 Q55 18 53 14 Q60 16 58 24" fill="currentColor" opacity="0.8"/>
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

// ── Alert Banner ───────────────────────────────────────────────────────────────
function Alert({ type, message }) {
  if (!message) return null;
  const styles = {
    error: { bg: 'rgba(239,68,68,0.1)', border: '#ef4444', color: '#dc2626', icon: '✕' },
    success: { bg: 'rgba(16,185,129,0.1)', border: '#10b981', color: '#059669', icon: '✓' },
    info: { bg: 'rgba(79,70,229,0.1)', border: '#4f46e5', color: '#4338ca', icon: 'ℹ' },
  };
  const s = styles[type] || styles.info;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
      padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.25rem',
      backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.color,
      fontSize: '0.875rem', lineHeight: 1.5,
    }}>
      <span style={{ fontWeight: 700, flexShrink: 0 }}>{s.icon}</span>
      <span>{message}</span>
    </div>
  );
}

// ── Input Field with icon ──────────────────────────────────────────────────────
function InputField({ id, label, type, value, onChange, placeholder, required, icon, rightEl, disabled }) {
  return (
    <div className="form-group" style={{ position: 'relative' }}>
      <label htmlFor={id}>{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: '0.875rem', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
          }}>
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          style={{ paddingLeft: icon ? '2.5rem' : undefined, paddingRight: rightEl ? '3rem' : undefined }}
        />
        {rightEl}
      </div>
    </div>
  );
}

// ── View modes ─────────────────────────────────────────────────────────────────
const VIEW = { SIGN_IN: 'signin', SIGN_UP: 'signup', FORGOT: 'forgot', RESET: 'reset' };

// ── Main LoginPage ─────────────────────────────────────────────────────────────
export default function LoginPage({ onAuthenticated }) {
  const isResetPath = window.location.pathname === '/reset-password';
  const [view, setView] = useState(isResetPath ? VIEW.RESET : VIEW.SIGN_IN);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlertState] = useState({ type: '', message: '' });

  const setAlert = (type, message) => setAlertState({ type, message });
  const clearAlert = () => setAlertState({ type: '', message: '' });

  const switchView = (v) => { clearAlert(); setPassword(''); setNewPassword(''); setConfirmPassword(''); setView(v); };

  // Password strength
  const passwordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
      { label: '', color: '' },
      { label: 'Weak', color: '#ef4444' },
      { label: 'Fair', color: '#f59e0b' },
      { label: 'Good', color: '#3b82f6' },
      { label: 'Strong', color: '#10b981' },
    ];
    return { score, ...map[score] };
  };

  const strength = (view === VIEW.SIGN_UP || view === VIEW.RESET) ? passwordStrength(view === VIEW.RESET ? newPassword : password) : null;

  const ToggleBtn = ({ show, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={show ? 'Hide password' : 'Show password'}
      style={{
        position: 'absolute', right: '0.75rem', top: '50%',
        transform: 'translateY(-50%)', background: 'none', border: 'none',
        cursor: 'pointer', color: 'var(--text-muted)', display: 'flex',
        padding: '0.25rem',
      }}
    >
      {show ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );

  // ── Sign In ──────────────────────────────────────────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault();
    clearAlert();
    setSubmitting(true);
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result?.error) {
        setAlert('error', result.error.message || 'Sign in failed. Please check your credentials.');
        return;
      }
      const sessionResult = await authClient.getSession();
      if (sessionResult?.data?.session && sessionResult?.data?.user) {
        onAuthenticated(sessionResult.data.session, sessionResult.data.user);
      } else {
        setAlert('error', 'Your email address may not be verified. Please check your inbox and verify before signing in.');
      }
    } catch (err) {
      setAlert('error', err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Sign Up ──────────────────────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault();
    clearAlert();
    if (password !== confirmPassword) {
      setAlert('error', 'Passwords do not match.');
      return;
    }
    if (strength.score < 2) {
      setAlert('error', 'Please choose a stronger password (at least 8 characters with uppercase and numbers).');
      return;
    }
    setSubmitting(true);
    try {
      const displayName = name.trim() || email.split('@')[0] || 'User';
      // Use the production URL as callback to avoid 500 errors if localhost is not registered in Neon Auth
      const callbackURL = window.location.hostname === 'localhost' 
        ? 'https://pig-farm-mgt-app.vercel.app' 
        : window.location.origin;
      const result = await authClient.signUp.email({ name: displayName, email, password, callbackURL });
      if (result?.error) {
        setAlert('error', result.error.message || 'Sign up failed. Please try again.');
        return;
      }
      setAlert('success', 'Account created! Please check your email and click the verification link before signing in.');
      setTimeout(() => switchView(VIEW.SIGN_IN), 4000);
    } catch (err) {
      setAlert('error', err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Forgot Password ──────────────────────────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearAlert();
    setSubmitting(true);
    try {
      const resetURL = window.location.hostname === 'localhost' 
        ? 'https://pig-farm-mgt-app.vercel.app/reset-password' 
        : window.location.origin + '/reset-password';
      const { error } = await authClient.forgetPassword({
        email,
        redirectTo: resetURL,
        callbackURL: resetURL,
      });
      if (error) {
        setAlert('error', error.message || 'Could not send reset email.');
      } else {
        setAlert('success', 'If an account exists for that email, a reset link has been sent. Check your inbox.');
      }
    } catch (err) {
      setAlert('error', err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset Password ───────────────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearAlert();
    if (newPassword !== confirmPassword) {
      setAlert('error', 'Passwords do not match.');
      return;
    }
    if (strength.score < 2) {
      setAlert('error', 'Please choose a stronger password.');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await authClient.resetPassword({ newPassword });
      if (error) {
        setAlert('error', error.message || 'Password reset failed.');
      } else {
        setAlert('success', 'Password reset successful! Redirecting to sign in…');
        setTimeout(() => { window.location.href = '/'; }, 2500);
      }
    } catch (err) {
      setAlert('error', err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Shared layout wrapper ────────────────────────────────────────────────────
  const Shell = ({ children, title, subtitle }) => (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'var(--background)', padding: '1.5rem',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(79,70,229,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(236,72,153,0.06) 0%, transparent 40%)',
    }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '1rem', margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(79,70,229,0.3)', color: 'white',
          }}>
            <PigIcon />
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
            Pig Farm Manager
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {subtitle || 'Manage your farm with ease'}
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.12)', borderRadius: '1.25rem' }}>
          {title && (
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
              {title}
            </h2>
          )}
          {children}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Pig Farm Manager · Secure & Private
        </p>
      </div>
    </div>
  );

  // ── RESET PASSWORD VIEW ──────────────────────────────────────────────────────
  if (view === VIEW.RESET) {
    return (
      <Shell title="Set New Password" subtitle="Enter your new password below">
        <Alert type={alert.type} message={alert.message} />
        <form onSubmit={handleResetPassword}>
          <InputField
            id="new-password" label="New Password" required
            type={showPassword ? 'text' : 'password'}
            value={newPassword} onChange={e => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters" icon={<LockIcon />}
            disabled={submitting}
            rightEl={<ToggleBtn show={showPassword} onClick={() => setShowPassword(p => !p)} />}
          />
          {newPassword && (
            <div style={{ marginTop: '-0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  height: '4px', flex: 1, borderRadius: '2px',
                  backgroundColor: i <= strength.score ? strength.color : 'var(--border)',
                  transition: 'background-color 0.3s',
                }} />
              ))}
              <span style={{ fontSize: '0.75rem', color: strength.color, minWidth: '3rem' }}>{strength.label}</span>
            </div>
          )}
          <InputField
            id="confirm-password" label="Confirm Password" required
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Repeat your new password" icon={<LockIcon />}
            disabled={submitting}
            rightEl={<ToggleBtn show={showConfirm} onClick={() => setShowConfirm(p => !p)} />}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.875rem' }} disabled={submitting}>
            {submitting ? <span className="spinner" /> : 'Reset Password'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
            <a href="/" style={{ color: 'var(--primary)' }}>← Back to Sign In</a>
          </p>
        </form>
      </Shell>
    );
  }

  // ── FORGOT PASSWORD VIEW ─────────────────────────────────────────────────────
  if (view === VIEW.FORGOT) {
    return (
      <Shell title="Forgot Password" subtitle="We'll send a reset link to your email">
        <Alert type={alert.type} message={alert.message} />
        <form onSubmit={handleForgotPassword}>
          <InputField
            id="forgot-email" label="Email Address" type="email" required
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" icon={<MailIcon />}
            disabled={submitting}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }} disabled={submitting}>
            {submitting ? <span className="spinner" /> : 'Send Reset Link'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
            Remembered it?{' '}
            <a href="#" onClick={e => { e.preventDefault(); switchView(VIEW.SIGN_IN); }} style={{ color: 'var(--primary)', fontWeight: 500 }}>
              Sign In
            </a>
          </p>
        </form>
      </Shell>
    );
  }

  // ── SIGN UP VIEW ─────────────────────────────────────────────────────────────
  if (view === VIEW.SIGN_UP) {
    return (
      <Shell title="Create Account" subtitle="Start managing your pig farm today">
        <Alert type={alert.type} message={alert.message} />
        <form onSubmit={handleSignUp}>
          <InputField
            id="signup-name" label="Full Name"
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="John Doe" icon={<UserIcon />} disabled={submitting}
          />
          <InputField
            id="signup-email" label="Email Address" type="email" required
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" icon={<MailIcon />} disabled={submitting}
          />
          <InputField
            id="signup-password" label="Password" required
            type={showPassword ? 'text' : 'password'}
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 8 characters" icon={<LockIcon />}
            disabled={submitting}
            rightEl={<ToggleBtn show={showPassword} onClick={() => setShowPassword(p => !p)} />}
          />
          {password && (
            <div style={{ marginTop: '-0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  height: '4px', flex: 1, borderRadius: '2px',
                  backgroundColor: i <= strength.score ? strength.color : 'var(--border)',
                  transition: 'background-color 0.3s',
                }} />
              ))}
              <span style={{ fontSize: '0.75rem', color: strength.color, minWidth: '3rem' }}>{strength.label}</span>
            </div>
          )}
          <InputField
            id="signup-confirm" label="Confirm Password" required
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password" icon={<LockIcon />}
            disabled={submitting}
            rightEl={<ToggleBtn show={showConfirm} onClick={() => setShowConfirm(p => !p)} />}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '0.25rem' }} disabled={submitting}>
            {submitting ? <span className="spinner" /> : 'Create Account'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <a href="#" onClick={e => { e.preventDefault(); switchView(VIEW.SIGN_IN); }} style={{ color: 'var(--primary)', fontWeight: 500 }}>
              Sign In
            </a>
          </p>
        </form>
      </Shell>
    );
  }

  // ── SIGN IN VIEW (default) ───────────────────────────────────────────────────
  return (
    <Shell title="Welcome Back" subtitle="Sign in to your farm dashboard">
      <Alert type={alert.type} message={alert.message} />
      <form onSubmit={handleSignIn}>
        <InputField
          id="signin-email" label="Email Address" type="email" required
          value={email} onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com" icon={<MailIcon />} disabled={submitting}
        />
        <InputField
          id="signin-password" label="Password" required
          type={showPassword ? 'text' : 'password'}
          value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Your password" icon={<LockIcon />}
          disabled={submitting}
          rightEl={<ToggleBtn show={showPassword} onClick={() => setShowPassword(p => !p)} />}
        />
        <div style={{ textAlign: 'right', marginTop: '-0.75rem', marginBottom: '1.25rem' }}>
          <a href="#" onClick={e => { e.preventDefault(); switchView(VIEW.FORGOT); }}
            style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 500 }}>
            Forgot password?
          </a>
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }} disabled={submitting}>
          {submitting ? <span className="spinner" /> : 'Sign In'}
        </button>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <a href="#" onClick={e => { e.preventDefault(); switchView(VIEW.SIGN_UP); }} style={{ color: 'var(--primary)', fontWeight: 500 }}>
            Sign Up
          </a>
        </p>
      </form>
    </Shell>
  );
}
