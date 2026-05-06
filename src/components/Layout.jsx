import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PiggyBank, 
  ClipboardList, 
  Utensils, 
  TrendingUp, 
  PackageOpen, 
  ArrowRightLeft, 
  Users 
} from 'lucide-react';

const NavItems = [
  { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/stock', label: 'Stock', icon: <PiggyBank size={20} /> },
  { path: '/management', label: 'Management', icon: <ClipboardList size={20} /> },
  { path: '/feeding', label: 'Feeding', icon: <Utensils size={20} /> },
  { path: '/sales', label: 'Sales', icon: <TrendingUp size={20} /> },
  { path: '/production-output', label: 'Output', icon: <PackageOpen size={20} /> },
  { path: '/production-inout', label: 'In/Out', icon: <ArrowRightLeft size={20} /> },
  { path: '/staff', label: 'Staff', icon: <Users size={20} /> },
];

export default function Layout() {
  return (
    <div className="app-container">
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

      <nav className="bottom-nav">
        {NavItems.slice(0, 5).map((item) => (
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
