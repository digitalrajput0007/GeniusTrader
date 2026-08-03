import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Activity, BarChart3, Bell, ChevronLeft, ChevronRight, FileText, LogOut, Menu, Moon, Plus, Search, Settings, ShieldCheck, Sun, Target, User, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import BrandLogo from './BrandLogo';

const navItems = [
  { label: 'Performance', to: '/performance', icon: BarChart3 },
  { label: 'Trade journal', to: '/paper-trades', icon: FileText },
  { label: 'Position sizing', to: '/position-sizer', icon: Target },
  { label: 'Risk management', to: '/risk-management', icon: ShieldCheck },
  { label: 'User Ranking', to: '/ranking', icon: Activity, adminOnly: true },
  { label: 'User Management', to: '/user-management', icon: Users, adminOnly: true },
];

const AppShell = ({ children }) => {
  const { currentUser, userData, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const initials = `${userData?.firstName?.[0] || ''}${userData?.lastName?.[0] || ''}`.toUpperCase() || 'GT';
  const name = userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() : currentUser?.email?.split('@')[0] || 'Trader';

  useEffect(() => {
    const close = (event) => profileRef.current && !profileRef.current.contains(event.target) && setProfileOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly) {
      return userData?.isAdmin;
    }
    return true;
  });

  const sidebar = (
    <aside className={`gt-sidebar ${collapsed ? 'gt-sidebar--collapsed' : ''} ${mobileOpen ? 'gt-sidebar--open' : ''}`}>
      <div className="gt-sidebar__brand">
        <BrandLogo compact={collapsed} />
        <button className="gt-icon-button gt-collapse-button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        <button className="gt-icon-button gt-mobile-close" onClick={closeMobile} aria-label="Close navigation"><X size={18} /></button>
      </div>
      <div className="gt-nav-label">{!collapsed && 'Workspace'}</div>
      <nav className="gt-navigation">
        {filteredNavItems.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={closeMobile} className={({ isActive }) => `gt-nav-link ${isActive ? 'gt-nav-link--active' : ''}`} title={collapsed ? label : undefined}>
            <Icon size={19} strokeWidth={2.2} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="gt-sidebar__bottom">
        
      </div>
    </aside>
  );

  return (
    <div className={`gt-app-shell ${collapsed ? 'gt-app-shell--collapsed' : ''}`}>
      {sidebar}
      {mobileOpen && <button className="gt-scrim" onClick={closeMobile} aria-label="Close menu" />}
      <section className="gt-main-area">
        <header className="gt-topbar">
          <button className="gt-icon-button gt-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <div className="gt-search"><Search size={17} /><input aria-label="Search" placeholder="Search your journal" /></div>
          <div className="gt-topbar__actions">
            <button className="gt-icon-button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="gt-icon-button gt-notification" aria-label="Notifications"><Bell size={18} /><i /></button>
            <button className="gt-primary-button gt-quick-add" onClick={() => navigate('/paper-trades')}><Plus size={17} /> Add trade</button>
            <div className="gt-profile" ref={profileRef}>
              <button className="gt-profile__trigger" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}>
                {userData?.photoURL ? <img src={userData.photoURL} alt="" /> : <span>{initials}</span>}
                <div><strong>{name}</strong><small>My account</small></div>
              </button>
              {profileOpen && <div className="gt-profile-menu">
                <Link to="/profile" onClick={() => setProfileOpen(false)}><User size={16} /> Profile</Link>
                <Link to="/change-password" onClick={() => setProfileOpen(false)}><Settings size={16} /> Settings</Link>
                <button onClick={handleLogout}><LogOut size={16} /> Sign out</button>
              </div>}
            </div>
          </div>
        </header>
        <main className="gt-page-content">{children}</main>
      </section>
    </div>
  );
};

export default AppShell;