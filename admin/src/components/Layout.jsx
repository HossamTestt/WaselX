/**
 * Sidebar + Layout Shell for WaselX Admin
 */
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, Gavel, BarChart2,
  Percent, LogOut, Truck, ShoppingBag
} from 'lucide-react';
import logo from '../assets/logo.png';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
  { to: '/shipments', icon: Package, label: 'Shipments' },
  { to: '/bids', icon: Gavel, label: 'Bids' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/commission', icon: Percent, label: 'Commission' },
];

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('waselx_admin_token');
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* ─── Sidebar ─────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="WaselX" style={{ height: '45px', marginBottom: '8px' }} />
          <div className="sidebar-subtitle">Admin Dashboard</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Platform</div>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">A</div>
            <div className="sidebar-user-info">
              <div className="name">WaselX Admin</div>
              <div className="role">Super Admin</div>
            </div>
            <button onClick={handleLogout} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────── */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
