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

  useEffect(() => {
    authClient.getSession().then((result) => {
      if (result.data?.session && result.data?.user) {
        setSession(result.data.session);
        setUser(result.data.user);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = isSignUp
      ? await authClient.signUp.email({ name: email.split('@')[0] || 'User', email, password })
      : await authClient.signIn.email({ email, password });

    if (result.error) {
      alert(result.error.message);
      return;
    }

    const sessionResult = await authClient.getSession();
    if (sessionResult.data?.session && sessionResult.data?.user) {
      setSession(sessionResult.data.session);
      setUser(sessionResult.data.user);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    setSession(null);
    setUser(null);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

  if (!session || !user) {
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
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
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
