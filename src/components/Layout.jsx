import React, { useState, useEffect } from 'react';
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
  Coins
} from 'lucide-react';

const NavItems = [
  { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/animals', label: 'Breeding Stock', icon: <Dna size={20} /> },
  { path: '/breeding', label: 'Breeding Logs', icon: <CalendarDays size={20} /> },
  { path: '/health', label: 'Health Logs', icon: <HeartPulse size={20} /> },
  { path: '/feed-inventory', label: 'Feed Stock', icon: <Warehouse size={20} /> },
  { path: '/weights', label: 'Weights', icon: <Scale size={20} /> },
  { path: '/analytics', label: 'Analytics', icon: <LineChart size={20} /> },
  { path: '/stock', label: 'Stock', icon: <PiggyBank size={20} /> },
  { path: '/management', label: 'Management', icon: <ClipboardList size={20} /> },
  { path: '/feeding', label: 'Feeding', icon: <Utensils size={20} /> },
  { path: '/sales', label: 'Sales', icon: <TrendingUp size={20} /> },
  { path: '/expenses', label: 'Expenses', icon: <Coins size={20} /> },
  { path: '/production-output', label: 'Output', icon: <PackageOpen size={20} /> },
  { path: '/production-inout', label: 'In/Out', icon: <ArrowRightLeft size={20} /> },
  { path: '/staff', label: 'Staff', icon: <Users size={20} /> },
];

export default function Layout() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isOnline && (
        <div style={{
          backgroundColor: 'var(--warning)', color: '#0f172a', padding: '0.5rem 1rem',
          textAlign: 'center', fontSize: '0.875rem', fontWeight: '600',
          position: 'sticky', top: 0, zIndex: 1000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <span>⚠️ Offline Mode — Data will be saved locally and synced when connection is restored.</span>
        </div>
      )}
      
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row', width: '100%' }}>
        <aside className="sidebar">
          <div style={{ padding: '1rem', marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PiggyBank /> PigFarm Mgt
            </h2>
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
          </nav>
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
