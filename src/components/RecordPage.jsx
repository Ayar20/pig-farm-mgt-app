import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';

export default function RecordPage({ title, tableName, columns }) {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/${tableName}`);
      const result = await response.json();
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
  }, [tableName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newRecord = {};
    columns.forEach(col => {
      newRecord[col.accessor] = formData.get(col.accessor);
    });

    try {
      const response = await fetch(`/api/${tableName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRecord)
      });
      
      if (response.ok) {
        setIsModalOpen(false);
        fetchData(); // refresh data
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
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Add Record
        </button>
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

      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th key={i}>{col.header}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, i) => (
                  <tr key={row.id || i}>
                    {columns.map((col, j) => (
                      <td key={j}>{
                        // Format date nicely if it looks like a date string
                        col.accessor === 'date' && row[col.accessor] 
                          ? new Date(row[col.accessor]).toLocaleDateString() 
                          : row[col.accessor]
                      }</td>
                    ))}
                    <td>
                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Edit</button>
                    </td>
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
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
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
