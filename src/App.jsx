import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RecordPage from './components/RecordPage';
import { authClient } from './auth';

function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  useEffect(() => {
    authClient.getSession().then((result) => {
      if (result.data?.session && result.data?.user) {
        setSession(result.data.session);
        setUser(result.data.user);
      }
      setLoading(false);
    });
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let result;
      if (isSignUp) {
        result = await authClient.signUp.email({ 
          name: email.split('@')[0] || 'User', 
          email, 
          password
        });
      } else {
        result = await authClient.signIn.email({ email, password });
      }

      if (result?.error) {
        alert(result.error.message);
        return;
      }

      if (isSignUp) {
        alert("Registration successful! Please check your email to verify your account before signing in.");
        setIsSignUp(false);
        setPassword('');
        return;
      }

      const sessionResult = await authClient.getSession();
      if (sessionResult.data?.session && sessionResult.data?.user) {
        setSession(sessionResult.data.session);
        setUser(sessionResult.data.user);
      }
    } catch (err) {
      console.error("Auth error:", err);
      alert("Authentication error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    setSession(null);
    setUser(null);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

  const isResettingPassword = window.location.pathname === '/reset-password';
  const [newPassword, setNewPassword] = useState('');

  if (isResettingPassword) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--background)' }}>
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setIsSubmitting(true);
            try {
              const { error } = await authClient.resetPassword({ newPassword });
              if (error) {
                alert(error.message);
              } else {
                alert('Password reset successful. Please sign in.');
                window.location.href = '/';
              }
            } catch (err) {
              alert("Error: " + err.message);
            } finally {
              setIsSubmitting(false);
            }
          }}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Reset Password</h2>
            <div className="form-group">
              <label>New Password</label>
              <div style={{ display: 'flex', position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ width: '100%', paddingRight: '4rem' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={isSubmitting}>
              {isSubmitting ? 'Loading...' : 'Reset Password'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
              <a href="/">Back to login</a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    if (isForgotPassword) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--background)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              try {
                const { error } = await authClient.forgetPassword({ email, redirectTo: window.location.origin + '/reset-password' });
                if (error) {
                  alert(error.message);
                } else {
                  alert('Password reset link sent to your email.');
                  setIsForgotPassword(false);
                }
              } catch (err) {
                alert("Error: " + err.message);
              } finally {
                setIsSubmitting(false);
              }
            }}>
              <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Reset Password</h2>
              <p style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.875rem' }}>Enter your email to receive a password reset link.</p>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setIsForgotPassword(false); }}>
                  Back to Sign In
                </a>
              </p>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--background)' }}>
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
          <form onSubmit={handleSubmit}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div style={{ display: 'flex', position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', paddingRight: '4rem' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            
            {!isSignUp && (
              <div style={{ textAlign: 'right', marginBottom: '1rem', fontSize: '0.875rem' }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); }}>
                  Forgot Password?
                </a>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={isSubmitting}>
              {isSubmitting ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsSignUp(false);
                    }}
                  >
                    Sign in
                  </a>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsSignUp(true);
                    }}
                  >
                    Sign up
                  </a>
                </>
              )}
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem', position: 'absolute', top: 0, right: 0, zIndex: 100 }}>
        <button onClick={handleSignOut} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          Sign Out ({user.email})
        </button>
      </div>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="stock" element={
            <RecordPage 
              title="Stock Record" 
              tableName="stock_records"
              columns={[
                { header: 'Date', accessor: 'date' },
                { header: 'Batch ID', accessor: 'batch' },
                { header: 'Type', accessor: 'type' },
                { header: 'Count', accessor: 'count' },
                { header: 'Status', accessor: 'status' }
              ]}
            />
          } />
          <Route path="management" element={
            <RecordPage 
              title="Management Record" 
              tableName="management_records"
              columns={[
                { header: 'Date', accessor: 'date' },
                { header: 'Task', accessor: 'task' },
                { header: 'Batch', accessor: 'batch' },
                { header: 'Assignee', accessor: 'assignee' },
                { header: 'Notes', accessor: 'notes' }
              ]}
            />
          } />
          <Route path="feeding" element={
            <RecordPage 
              title="Feeding Record" 
              tableName="feeding_records"
              columns={[
                { header: 'Date', accessor: 'date' },
                { header: 'Batch ID', accessor: 'batch' },
                { header: 'Feed Type', accessor: 'feed_type' },
                { header: 'Quantity', accessor: 'quantity' },
                { header: 'Cost', accessor: 'cost' }
              ]}
            />
          } />
          <Route path="sales" element={
            <RecordPage 
              title="Sales Record" 
              tableName="sales_records"
              columns={[
                { header: 'Date', accessor: 'date' },
                { header: 'Invoice #', accessor: 'invoice' },
                { header: 'Customer', accessor: 'customer' },
                { header: 'Qty', accessor: 'qty' },
                { header: 'Total Value', accessor: 'total' }
              ]}
            />
          } />
          <Route path="production-output" element={
            <RecordPage 
              title="Production Output" 
              tableName="production_output_records"
              columns={[
                { header: 'Date', accessor: 'date' },
                { header: 'Batch ID', accessor: 'batch' },
                { header: 'Piglets Born', accessor: 'piglets_born' },
                { header: 'Alive', accessor: 'alive' },
                { header: 'Dead', accessor: 'dead' }
              ]}
            />
          } />
          <Route path="production-inout" element={
            <RecordPage 
              title="Production In/Out" 
              tableName="production_inout_records"
              columns={[
                { header: 'Date', accessor: 'date' },
                { header: 'Type', accessor: 'type' },
                { header: 'Category', accessor: 'category' },
                { header: 'Description', accessor: 'description' },
                { header: 'Value', accessor: 'value' }
              ]}
            />
          } />
          <Route path="staff" element={
            <RecordPage 
              title="Staff Record" 
              tableName="staff_records"
              columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Role', accessor: 'role' },
                { header: 'Phone', accessor: 'phone' },
                { header: 'Status', accessor: 'status' }
              ]}
            />
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
