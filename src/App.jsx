import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RecordPage from './components/RecordPage';
import LoginPage from './pages/LoginPage';
import { authClient } from './auth';

function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authClient.getSession()
      .then((result) => {
        if (result?.data?.session && result?.data?.user) {
          setSession(result.data.session);
          setUser(result.data.user);
        }
      })
      .catch((err) => {
        console.error('Failed to get session:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAuthenticated = (newSession, newUser) => {
    setSession(newSession);
    setUser(newUser);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    setSession(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', height: '100vh', gap: '1rem',
        backgroundColor: 'var(--background)',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '0.75rem',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          <span style={{ fontSize: '1.5rem' }}>🐷</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading Pig Farm Manager…</p>
      </div>
    );
  }

  if (!session || !user) {
    return <LoginPage onAuthenticated={handleAuthenticated} />;
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
