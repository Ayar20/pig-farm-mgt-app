import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, CloudOff, Printer } from 'lucide-react';
import { apiFetch, apiPost } from '../utils/api';
import { useRole } from '../context/RoleContext';
import { printTable } from '../utils/pdf';

export default function RecordPage({ title, tableName, columns }) {
  const { isWorker } = useRole();
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await apiFetch(`/api/${tableName}`);
      if (Array.isArray(result)) {
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    
    const handleSyncCompleted = () => {
      fetchData();
    };
    window.addEventListener('sync-completed', handleSyncCompleted);
    return () => {
      window.removeEventListener('sync-completed', handleSyncCompleted);
    };
  }, [tableName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newRecord = {};
    columns.forEach(col => {
      newRecord[col.accessor] = formData.get(col.accessor);
    });

    try {
      const response = await apiPost(`/api/${tableName}`, newRecord);
      
      if (response.success) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert('Failed to add record');
      }
    } catch (error) {
      console.error('Error adding data:', error);
      alert('Error adding record');
    }
  };

  const filteredData = data.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>{title}</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn btn-outline" onClick={() => printTable('print-region-' + tableName)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <Printer size={16} /> Print
          </button>
          {!isWorker && (
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              Add Record
            </button>
          )}
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex justify-between items-center gap-4">
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <button className="btn btn-outline">
            <Filter size={18} />
            Filter
          </button>
        </div>
      </div>

      <div className="table-container" id={`print-region-${tableName}`}>
        <div className="print-header" style={{ display: 'none' }}>
          <h2>🐷 PigFarm Management — {title}</h2>
          <p>Generated: {new Date().toLocaleDateString()}</p>
        </div>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th key={i}>{col.header}</th>
                ))}
                {!isWorker && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, i) => (
                  <tr key={row.id || i} style={{ opacity: row._offline ? 0.7 : 1 }}>
                    {columns.map((col, j) => (
                      <td key={j}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{
                            col.accessor === 'date' && row[col.accessor]
                              ? new Date(row[col.accessor]).toLocaleDateString()
                              : row[col.accessor]
                          }</span>
                          {j === 0 && row._offline && (
                            <span
                              className="badge badge-warning"
                              style={{
                                fontSize: '0.65rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.125rem 0.375rem'
                              }}
                            >
                              <CloudOff size={10} /> Pending Sync
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                    {!isWorker && (
                      <td>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                          disabled={row._offline}
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>No records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem', overflowY: 'auto'
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', margin: 'auto' }}>
            <h2>Add New {title}</h2>
            <form onSubmit={handleSubmit}>
              {columns.map((col, i) => (
                <div className="form-group" key={i}>
                  <label>{col.header}</label>
                  {col.accessor === 'date' ? (
                    <input type="date" name={col.accessor} required />
                  ) : col.accessor === 'count' || col.accessor === 'qty' || col.accessor.includes('piglets') || col.accessor === 'alive' || col.accessor === 'dead' ? (
                    <input type="number" name={col.accessor} required placeholder={`Enter ${col.header.toLowerCase()}`} />
                  ) : (
                    <input type="text" name={col.accessor} required placeholder={`Enter ${col.header.toLowerCase()}`} />
                  )}
                </div>
              ))}
              <div className="flex justify-between mt-6">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
