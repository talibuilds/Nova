import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { activityService } from '../services/services';
import { HiOutlineSun, HiOutlineMoon, HiOutlineBell, HiOutlineMenu } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';

const Header = ({ collapsed, title, subtitle, onMobileMenuToggle }) => {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [activities, setActivities] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Fetch notifications (recent activities)
    const fetchActivities = async () => {
      try {
        const { data } = await activityService.getAll({ limit: 5 });
        setActivities(data.activities || []);
      } catch (error) {
        console.error('Fetch activities error:', error);
      }
    };
    fetchActivities();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getActivityIcon = (action) => {
    const icons = {
      project_created: { icon: '📁', bg: 'var(--primary-100)', color: 'var(--primary-600)' },
      task_created: { icon: '✅', bg: 'var(--success-light)', color: 'var(--success)' },
      task_status_changed: { icon: '🔄', bg: 'var(--info-light)', color: 'var(--info)' },
      task_assigned: { icon: '👤', bg: 'var(--warning-light)', color: 'var(--warning)' },
      comment_added: { icon: '💬', bg: 'var(--accent-cyan)', color: 'white' },
      member_added: { icon: '👥', bg: 'var(--primary-100)', color: 'var(--primary-600)' },
    };
    return icons[action] || { icon: '📌', bg: 'var(--gray-100)', color: 'var(--gray-500)' };
  };

  return (
    <header className={`header ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="header-left">
        <button className="header-icon-btn mobile-only" onClick={onMobileMenuToggle} id="mobile-menu-btn">
          <HiOutlineMenu />
        </button>
        <div className="header-title">
          <h1>{title || 'Dashboard'}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      <div className="header-right">
        <button className="header-icon-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'} id="theme-toggle">
          {theme === 'dark' ? <HiOutlineSun /> : <HiOutlineMoon />}
        </button>
        
        <div className="dropdown" ref={dropdownRef}>
          <button 
            className="header-icon-btn" 
            title="Notifications" 
            id="notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <HiOutlineBell />
            {activities.length > 0 && <span className="badge-dot"></span>}
          </button>
          
          {showNotifications && (
            <div className="dropdown-menu" style={{ width: '320px', padding: '0', right: '-10px', top: '120%' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>
                Notifications
              </div>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {activities.length > 0 ? (
                  activities.map((activity) => {
                    const actIcon = getActivityIcon(activity.action);
                    return (
                      <div key={activity._id} className="dropdown-item" style={{ padding: '12px 16px', whiteSpace: 'normal', alignItems: 'flex-start', gap: '12px' }}>
                        <div className="activity-icon" style={{ background: actIcon.bg, fontSize: '0.875rem', width: '32px', height: '32px', flexShrink: 0 }}>
                          {actIcon.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', lineHeight: '1.4', color: 'var(--text-primary)' }}>
                            <strong>{activity.user?.name}</strong> {activity.details}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
