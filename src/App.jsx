import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RecordPage from './components/RecordPage';

function App() {
  return (
    <BrowserRouter>
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
