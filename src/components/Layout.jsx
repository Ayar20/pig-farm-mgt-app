import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  PiggyBank,
  ClipboardList,
  Utensils,
  TrendingUp,
  PackageOpen,
  ArrowRightLeft,
  Users,
  Dna,
  CalendarDays,
  HeartPulse,
  Warehouse,
  Scale,
  LineChart,
  Coins,
  Shield,
  Bell,
  BellDot,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';

const AllNavItems = [
  { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['admin', 'manager', 'worker'] },
  { path: '/animals', label: 'Breeding Stock', icon: <Dna size={20} />, roles: ['admin', 'manager', 'worker'] },
  { path: '/breeding', label: 'Breeding Logs', icon: <CalendarDays size={20} />, roles: ['admin', 'manager', 'worker'] },
  { path: '/health', label: 'Health Logs', icon: <HeartPulse size={20} />, roles: ['admin', 'manager', 'worker'] },
  { path: '/feed-inventory', label: 'Feed Stock', icon: <Warehouse size={20} />, roles: ['admin', 'manager', 'worker'] },
  { path: '/weights', label: 'Weights', icon: <Scale size={20} />, roles: ['admin', 'manager', 'worker'] },
  { path: '/analytics', label: 'Analytics', icon: <LineChart size={20} />, roles: ['admin', 'manager'] },
  { path: '/stock', label: 'Stock', icon: <PiggyBank size={20} />, roles: ['admin', 'manager', 'worker'] },
  { path: '/management', label: 'Management', icon: <ClipboardList size={20} />, roles: ['admin', 'manager'] },
  { path: '/feeding', label: 'Feeding', icon: <Utensils size={20} />, roles: ['admin', 'manager', 'worker'] },
  { path: '/sales', label: 'Sales', icon: <TrendingUp size={20} />, roles: ['admin', 'manager'] },
  { path: '/expenses', label: 'Expenses', icon: <Coins size={20} />, roles: ['admin', 'manager'] },
  { path: '/production-output', label: 'Output', icon: <PackageOpen size={20} />, roles: ['admin', 'manager'] },
  { path: '/production-inout', label: 'In/Out', icon: <ArrowRightLeft size={20} />, roles: ['admin', 'manager'] },
  { path: '/staff', label: 'Staff', icon: <Users size={20} />, roles: ['admin', 'manager'] },
];

const ROLE_BADGE = {
  admin:   { label: 'Admin',   bg: '#3b0764', color: '#e9d5ff', border: '#7c3aed' },
  manager: { label: 'Manager', bg: '#1e3a5f', color: '#bfdbfe', border: '#3b82f6' },
  worker:  { label: 'Worker',  bg: '#1a2e1a', color: '#bbf7d0', border: '#22c55e' },
};

export default function Layout({ onSignOut, userEmail }) {
  const { role, isAdmin } = useRole();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifications, setNotifications] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  // Filter nav items based on current role
  const NavItems = AllNavItems.filter(item => item.roles.includes(role));

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch upcoming notifications
  useEffect(() => {
    fetch('/api/notifications/upcoming')
      .then(r => r.json())
      .then(data => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Close bell dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const badge = ROLE_BADGE[role] || ROLE_BADGE.worker;

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isOnline && (
        <div style={{
          backgroundColor: 'var(--warning)', color: '#0f172a', padding: '0.5rem 1rem',
          textAlign: 'center', fontSize: '0.875rem', fontWeight: '600',
          position: 'sticky', top: 0, zIndex: 1000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <span>⚠️ Offline Mode — Data will be saved locally and synced when connection is restored.</span>
        </div>
      )}

      {/* Mobile Top Bar */}
      <header className="mobile-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 90
      }}>
        <h2 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', margin: 0 }}>
          <PiggyBank size={18} /> PigFarm Mgt
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={onSignOut} 
            className="btn btn-outline" 
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, flexDirection: 'row', width: '100%' }}>
        <aside className="sidebar">
          {/* Logo + bell */}
          <div style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, margin: 0 }}>
              <PiggyBank /> PigFarm Mgt
            </h2>

            {/* Notification Bell */}
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button
                id="notification-bell"
                onClick={() => setBellOpen(o => !o)}
                title="Upcoming alerts"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: notifications.length > 0 ? 'var(--warning)' : 'var(--text-muted)',
                  position: 'relative', padding: '0.25rem',
                }}
              >
                {notifications.length > 0 ? <BellDot size={22} /> : <Bell size={22} />}
                {notifications.length > 0 && (
                  <span style={{
                    position: 'absolute', top: '-2px', right: '-2px',
                    background: 'var(--danger)', color: '#fff',
                    borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700,
                    padding: '0 4px', minWidth: '16px', textAlign: 'center', lineHeight: '16px',
                  }}>{notifications.length}</span>
                )}
              </button>

              {bellOpen && (
                <div style={{
                  position: 'absolute', top: '2.2rem', left: '50%', transform: 'translateX(-50%)',
                  width: '280px', background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '0.75rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  zIndex: 2000, overflow: 'hidden',
                }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🔔 Upcoming Alerts</span>
                    <button onClick={() => setBellOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <X size={16} />
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No upcoming alerts ✅
                    </div>
                  ) : (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {notifications.map((n, i) => (
                        <div key={i} style={{
                          padding: '0.75rem 1rem',
                          borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                          display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                        }}>
                          <AlertTriangle size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{n.type}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{n.label} — Due {n.due_date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Role badge */}
          <div style={{ padding: '0 1rem', marginBottom: '1.25rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.7rem',
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
            }}>
              <Shield size={11} /> {badge.label}
            </span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {NavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
            {/* Admin-only link */}
            {isAdmin && (
              <NavLink
                to="/admin/users"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}
              >
                <Shield size={20} />
                <span>User Roles</span>
              </NavLink>
            )}
          </nav>

          {/* User Profile Section at bottom of Sidebar */}
          <div style={{
            marginTop: 'auto',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Logged in as</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', wordBreak: 'break-all' }} title={userEmail}>
                {userEmail}
              </span>
            </div>
            <button
              onClick={onSignOut}
              className="btn btn-outline"
              style={{ width: '100%', padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              Sign Out
            </button>
          </div>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav">
        {NavItems.slice(0, 8).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
