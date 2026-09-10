import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/services';
import toast from 'react-hot-toast';
import {
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineColorSwatch,
  HiOutlineSun,
  HiOutlineMoon
} from 'react-icons/hi';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Profile form
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    department: user?.department || '',
  });

  // Password form
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profile.name.trim() || !profile.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.updateProfile(profile);
      updateUser(data);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const sections = [
    { id: 'profile', icon: HiOutlineUser, label: 'Profile' },
    { id: 'password', icon: HiOutlineLockClosed, label: 'Password' },
    { id: 'appearance', icon: HiOutlineColorSwatch, label: 'Appearance' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account preferences</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <section.icon /> {section.label}
            </button>
          ))}
        </div>

        <div>
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="settings-section slide-up">
              <h3 className="settings-section-title">Profile Information</h3>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="avatar avatar-xl">
                  {getInitials(profile.name)}
                </div>
                <div>
                  <h4 className="font-bold" style={{ fontSize: 'var(--font-lg)' }}>{profile.name}</h4>
                  <p className="text-secondary">{profile.email}</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Engineering, Design"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Tell us about yourself..."
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={3}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Password Section */}
          {activeSection === 'password' && (
            <div className="settings-section slide-up">
              <h3 className="settings-section-title">Change Password</h3>

              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter current password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Min 6 characters"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Confirm new password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <div className="settings-section slide-up">
              <h3 className="settings-section-title">Appearance</h3>

              <div className="form-group">
                <label className="form-label">Theme</label>
                <p className="text-secondary text-sm mb-4">Choose your preferred color scheme</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', maxWidth: '400px' }}>
                  <button
                    className={`card card-hover ${theme === 'light' ? '' : ''}`}
                    onClick={() => theme !== 'light' && toggleTheme()}
                    style={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: theme === 'light' ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
                      padding: 'var(--space-6)',
                    }}
                  >
                    <HiOutlineSun style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: 'var(--space-2)' }} />
                    <div className="font-semibold">Light</div>
                    <div className="text-xs text-secondary">Clean & bright</div>
                  </button>

                  <button
                    className={`card card-hover`}
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    style={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: theme === 'dark' ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
                      padding: 'var(--space-6)',
                    }}
                  >
                    <HiOutlineMoon style={{ fontSize: '2rem', color: '#6366f1', marginBottom: 'var(--space-2)' }} />
                    <div className="font-semibold">Dark</div>
                    <div className="text-xs text-secondary">Easy on eyes</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
