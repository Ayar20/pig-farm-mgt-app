import React, { useState, useEffect } from 'react';
import { Shield, UserCheck, Trash2, UserPlus, RefreshCw } from 'lucide-react';

const ROLE_COLORS = {
  admin: { bg: '#3b0764', color: '#e9d5ff', border: '#7c3aed' },
  manager: { bg: '#1e3a5f', color: '#bfdbfe', border: '#3b82f6' },
  worker: { bg: '#1a2e1a', color: '#bbf7d0', border: '#22c55e' },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('worker');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/user-roles')
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => showToast('Failed to load users', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpsert = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setSaving(true);
    try {
      const r = await fetch('/api/user-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim(), role: newRole }),
      });
      if (!r.ok) throw new Error();
      showToast(`Role set for ${newEmail}`);
      setNewEmail('');
      fetchUsers();
    } catch {
      showToast('Failed to save role', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (email, role) => {
    try {
      await fetch('/api/user-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      setUsers(prev => prev.map(u => u.email === email ? { ...u, role } : u));
      showToast(`Updated ${email} to ${role}`);
    } catch {
      showToast('Update failed', 'error');
    }
  };

  const handleDelete = async (email) => {
    if (!confirm(`Remove role for ${email}? They will default to Worker.`)) return;
    try {
      await fetch(`/api/user-roles/${encodeURIComponent(email)}`, { method: 'DELETE' });
      setUsers(prev => prev.filter(u => u.email !== email));
      showToast(`Removed role for ${email}`);
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '860px', margin: '0 auto' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: toast.type === 'error' ? 'var(--danger)' : 'var(--success)',
          color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '0.75rem',
          fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.2s ease',
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{
          width: '3rem', height: '3rem', borderRadius: '0.75rem',
          background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Shield size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>User Role Management</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Assign Admin, Manager, or Worker roles to farm users
          </p>
        </div>
        <button onClick={fetchUsers} className="btn btn-outline" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Add / Edit role form */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={18} /> Assign Role to User
        </h3>
        <form onSubmit={handleUpsert} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 260px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>User Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="user@example.com"
              required
              style={{
                width: '100%', padding: '0.6rem 0.9rem', borderRadius: '0.5rem',
                border: '1px solid var(--border)', background: 'var(--surface)',
                color: 'var(--text)', fontSize: '0.9rem',
              }}
            />
          </div>
          <div style={{ flex: '0 1 160px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Role</label>
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
              style={{
                width: '100%', padding: '0.6rem 0.9rem', borderRadius: '0.5rem',
                border: '1px solid var(--border)', background: 'var(--surface)',
                color: 'var(--text)', fontSize: '0.9rem',
              }}
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="worker">Worker</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem' }}>
            <UserCheck size={16} /> {saving ? 'Saving…' : 'Save Role'}
          </button>
        </form>
      </div>

      {/* User roles table */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem' }}>
          Current Assignments ({users.length})
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No roles assigned yet. All users default to Worker.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-elevated)' }}>
                {['Email', 'Role', 'Change Role', 'Action'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const rc = ROLE_COLORS[u.role] || ROLE_COLORS.worker;
                return (
                  <tr key={u.email} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '0.9rem 1rem', fontSize: '0.875rem' }}>{u.email}</td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem',
                        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                        background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
                      }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.email, e.target.value)}
                        style={{
                          padding: '0.4rem 0.6rem', borderRadius: '0.4rem',
                          border: '1px solid var(--border)', background: 'var(--surface)',
                          color: 'var(--text)', fontSize: '0.85rem',
                        }}
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="worker">Worker</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <button
                        onClick={() => handleDelete(u.email)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                      >
                        <Trash2 size={15} /> Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Role legend */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[
          { role: 'admin', desc: 'Full access — all records, analytics, reports, user management' },
          { role: 'manager', desc: 'All records + analytics + reports, no user management' },
          { role: 'worker', desc: 'Read-only: stock, feeding, health, weights — no financials' },
        ].map(({ role, desc }) => {
          const rc = ROLE_COLORS[role];
          return (
            <div key={role} style={{ flex: '1 1 220px', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: rc.bg, border: `1px solid ${rc.border}` }}>
              <span style={{ fontWeight: 700, color: rc.color, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>{role}</span>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: rc.color, opacity: 0.85 }}>{desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
