
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Search, FileText, House, Users, Database } from 'lucide-react';

const Layout: React.FC = () => {
  return (
    <div className="layout">
      {/* Sidebar / Navigation */}
      <nav className="sidebar glass-panel">
        <div className="logo-area">
          <div className="logo-icon">
            <div className="logo-dot"></div>
          </div>
          <span className="logo-text">My<span className="text-light">ORG</span></span>
        </div>

        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>
              <House size={20} />
              <span>Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/search" className={({ isActive }) => isActive ? 'active' : ''}>
              <Search size={20} />
              <span>Search</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/hierarchy" className={({ isActive }) => isActive ? 'active' : ''}>
              <Users size={20} />
              <span>Hierarchy</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/references" className={({ isActive }) => isActive ? 'active' : ''}>
              <Database size={20} />
              <span>References</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}>
              <FileText size={20} />
              <span>Reports</span>
            </NavLink>
          </li>
        </ul>

        <div className="user-area">
          <div className="avatar">AD</div>
          <div className="user-info">
            <span className="name">Admin User</span>
            <span className="role">System Admin</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-scroll">
          <Outlet />
        </div>
      </main>

      <style>{`
        .layout {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }

        .sidebar {
          width: 260px;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: var(--space-lg);
          z-index: 10;
        }

        .logo-area {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-xl);
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--primary), var(--success));
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .logo-dot {
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
        }

        .logo-text {
          font-weight: 700;
          font-size: 1.25rem;
          letter-spacing: -0.5px;
        }
        
        .text-light { color: var(--text-light); }

        .nav-links {
          list-style: none;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .nav-links a {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          border-radius: var(--radius);
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .nav-links a:hover {
          background: rgba(255, 255, 255, 0.5);
          color: var(--primary);
          transform: translateX(4px);
        }

        .nav-links a.active {
          background: white;
          color: var(--primary);
          box-shadow: var(--shadow-sm);
          font-weight: 600;
        }

        .user-area {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding-top: var(--space-md);
          border-top: 1px solid var(--border);
        }

        .avatar {
          width: 40px;
          height: 40px;
          background: var(--secondary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-info .name {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .user-info .role {
          font-size: 0.75rem;
          color: var(--text-light);
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .top-bar {
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-xl);
          margin: var(--space-md);
          margin-bottom: 0;
          border-radius: var(--radius-lg);
        }
        
        .content-scroll {
          flex: 1;
          padding: var(--space-md);
          overflow-y: auto;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--text-muted);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        
        .icon-btn:hover {
          background: rgba(0,0,0,0.05);
          color: var(--text-main);
        }

        @media (max-width: 768px) {
          .sidebar {
            position: absolute;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
