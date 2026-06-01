import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RecordPage from './components/RecordPage';
import LoginPage from './pages/LoginPage';
import AnalyticsPage from './pages/AnalyticsPage';
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
                { header: 'Batch ID', accessor: 'batch' },
                { header: 'Qty', accessor: 'qty' },
                { header: 'Total Value', accessor: 'total' }
              ]}
            />
          } />
          <Route path="expenses" element={
            <RecordPage 
              title="Expense Records" 
              tableName="expense_records"
              columns={[
                { header: 'Date', accessor: 'date' },
                { header: 'Category', accessor: 'category' },
                { header: 'Amount ($)', accessor: 'amount' },
                { header: 'Batch ID', accessor: 'batch' },
                { header: 'Description', accessor: 'description' }
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
          <Route path="animals" element={
            <RecordPage 
              title="Breeding Stock" 
              tableName="individual_animals"
              columns={[
                { header: 'Ear Tag', accessor: 'ear_tag' },
                { header: 'Gender', accessor: 'gender' },
                { header: 'Breed', accessor: 'breed' },
                { header: 'Date of Birth', accessor: 'dob' },
                { header: 'Sire Tag', accessor: 'sire_tag' },
                { header: 'Dam Tag', accessor: 'dam_tag' },
                { header: 'Status', accessor: 'status' },
                { header: 'Notes', accessor: 'notes' }
              ]}
            />
          } />
          <Route path="breeding" element={
            <RecordPage 
              title="Breeding Logs" 
              tableName="breeding_records"
              columns={[
                { header: 'Sow Tag', accessor: 'sow_tag' },
                { header: 'Boar Tag', accessor: 'boar_tag' },
                { header: 'Service Date', accessor: 'service_date' },
                { header: 'Pregnancy Check', accessor: 'pregnancy_check_date' },
                { header: 'Pregnancy Status', accessor: 'pregnancy_status' },
                { header: 'Expected Farrowing', accessor: 'expected_farrowing_date' },
                { header: 'Actual Farrowing', accessor: 'actual_farrowing_date' },
                { header: 'Weaning Date', accessor: 'weaning_date' },
                { header: 'Notes', accessor: 'notes' }
              ]}
            />
          } />
          <Route path="health" element={
            <RecordPage 
              title="Health Logs" 
              tableName="health_records"
              columns={[
                { header: 'Type', accessor: 'record_type' },
                { header: 'Date', accessor: 'date' },
                { header: 'Animal Tag', accessor: 'animal_tag' },
                { header: 'Batch ID', accessor: 'batch' },
                { header: 'Diagnosis', accessor: 'diagnostics' },
                { header: 'Medication/Product', accessor: 'product_name' },
                { header: 'Dosage', accessor: 'dosage' },
                { header: 'Withdrawal (Days)', accessor: 'withdrawal_days' },
                { header: 'Withdrawal End', accessor: 'withdrawal_end_date' },
                { header: 'Notes', accessor: 'notes' }
              ]}
            />
          } />
          <Route path="feed-inventory" element={
            <RecordPage 
              title="Feed Inventory" 
              tableName="feed_inventory"
              columns={[
                { header: 'Date', accessor: 'date' },
                { header: 'Feed Type', accessor: 'feed_type' },
                { header: 'Transaction', accessor: 'transaction_type' },
                { header: 'Quantity (kg)', accessor: 'quantity_kg' },
                { header: 'Cost', accessor: 'cost' },
                { header: 'Notes', accessor: 'notes' }
              ]}
            />
          } />
          <Route path="weights" element={
            <RecordPage 
              title="Weight Records" 
              tableName="weight_records"
              columns={[
                { header: 'Date', accessor: 'date' },
                { header: 'Batch ID', accessor: 'batch' },
                { header: 'Animal Tag', accessor: 'animal_tag' },
                { header: 'Weight (kg)', accessor: 'weight_kg' },
                { header: 'Stage', accessor: 'weighing_stage' },
                { header: 'Notes', accessor: 'notes' }
              ]}
            />
          } />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
