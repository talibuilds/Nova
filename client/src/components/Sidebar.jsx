import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineFolder,
  HiOutlineViewBoards,
  HiOutlineClipboardList,
  HiOutlineCog,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineLogout
} from 'react-icons/hi';

const navItems = [
  { path: '/', icon: HiOutlineViewGrid, label: 'Dashboard' },
  { path: '/projects', icon: HiOutlineFolder, label: 'Projects' },
  { path: '/board', icon: HiOutlineViewBoards, label: 'Kanban Board' },
  { path: '/tasks', icon: HiOutlineClipboardList, label: 'My Tasks' },
  { path: '/settings', icon: HiOutlineCog, label: 'Settings' },
];

const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <img src="/logo.png" alt="Nova" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'contain' }} />
        <span className="sidebar-logo-text">NOVA</span>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            end={item.path === '/'}
            onClick={() => {
              if (window.innerWidth <= 768 && onMobileClose) {
                onMobileClose();
              }
            }}
          >
            <span className="sidebar-nav-icon">
              <item.icon />
            </span>
            <span className="sidebar-nav-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={() => {}}>
          <div className="avatar avatar-sm">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              getInitials(user?.name)
            )}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-email">{user?.email}</div>
          </div>
        </div>

        <button className="sidebar-toggle" onClick={logout} title="Logout">
          <HiOutlineLogout style={{ fontSize: '1.2rem' }} />
          {!collapsed && <span className="sidebar-nav-text" style={{ marginLeft: '8px', fontSize: '0.8125rem' }}>Logout</span>}
        </button>

        <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
