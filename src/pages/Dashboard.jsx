import React from 'react';
import { Users, PiggyBank, TrendingUp, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <button className="btn btn-primary">Generate Report</button>
      </div>

      <div className="dashboard-grid">
        <div className="card stat-card">
          <div className="stat-icon">
            <PiggyBank size={24} />
          </div>
          <div>
            <div className="stat-value">1,248</div>
            <div className="stat-label">Total Stock</div>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-value">$12,450</div>
            <div className="stat-label">Monthly Sales</div>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="stat-value">3</div>
            <div className="stat-label">Health Alerts</div>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', color: 'var(--secondary)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">12</div>
            <div className="stat-label">Active Staff</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <h2>Recent Activities</h2>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { title: 'Feeding Log Updated', time: '2 hours ago', type: 'Feeding' },
              { title: 'New Stock Added: 15 Piglets', time: '5 hours ago', type: 'Stock' },
              { title: 'Sales Record #1024', time: '1 day ago', type: 'Sales' },
            ].map((activity, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: i !== 2 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <div style={{ fontWeight: '500' }}>{activity.title}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{activity.time}</div>
                </div>
                <span className="badge badge-success">{activity.type}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card">
          <h2>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <button className="btn btn-outline" style={{ height: '100px', flexDirection: 'column' }}>
              <PiggyBank size={24} className="mb-4" />
              Add Stock
            </button>
            <button className="btn btn-outline" style={{ height: '100px', flexDirection: 'column' }}>
              <TrendingUp size={24} className="mb-4" />
              Record Sale
            </button>
            <button className="btn btn-outline" style={{ height: '100px', flexDirection: 'column' }}>
              <Users size={24} className="mb-4" />
              Manage Staff
            </button>
            <button className="btn btn-outline" style={{ height: '100px', flexDirection: 'column' }}>
              <AlertCircle size={24} className="mb-4" />
              Report Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
