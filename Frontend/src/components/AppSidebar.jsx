import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Help as HelpIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  VerifiedUser as VerifiedUserIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import './AppSidebar.css';

const AppSidebar = ({ userType, user, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Admin navigation items
  const adminNavItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />
    },
    {
      path: '/client',
      label: 'Clients',
      icon: <PeopleIcon />
    },
    {
      path: '/employees',
      label: 'Employees',
      icon: <PersonIcon />
    },
    {
      path: '/application',
      label: 'Applications',
      icon: <AssignmentIcon />
    },
    {
      path: '/help',
      label: 'Help',
      icon: <HelpIcon />
    }
  ];

  // Verifier navigation items
  const verifierNavItems = [
    {
      path: '/verifier-dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />
    },
    {
      path: '/verifier-applications',
      label: 'Applications',
      icon: <AssignmentIcon />
    },
    {
      path: '/pending',
      label: 'Pending',
      icon: <PendingIcon />
    },
    {
      path: '/approved',
      label: 'Approved',
      icon: <CheckCircleIcon />
    },
    {
      path: '/verifier-help',
      label: 'Help',
      icon: <HelpIcon />
    }
  ];

  // Company navigation items (future)
  const companyNavItems = [
    {
      path: '/company-dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />
    }
    // {
    //   path: '/company-applications',
    //   label: 'Applications',
    //   icon: <AssignmentIcon />
    // },
    // {
    //   path: '/company-stats',
    //   label: 'Statistics',
    //   icon: <CheckCircleIcon />
    // }
  ];

  // Select navigation items based on user type
  const getNavItems = () => {
    switch (userType) {
      case 'admin':
        return adminNavItems;
      case 'verifier':
        return verifierNavItems;
      case 'company':
        return companyNavItems;
      default:
        return adminNavItems;
    }
  };

  const navItems = getNavItems();

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.full_name || `${user.first_name} ${user.last_name}`;
  };

  // Get user role display name
  const getUserRoleDisplay = () => {
    switch (userType) {
      case 'admin':
        return 'Administrator';
      case 'verifier':
        return 'Verifier';
      case 'company':
        return 'Company User';
      default:
        return 'User';
    }
  };

  return (
    <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className={isCollapsed ? 'sidebar-header-collapsed' : 'sidebar-header'}>
        <div className={isCollapsed ? 'sidebar-logo-collapsed' : 'sidebar-logo'}>
          <img src="/Logo.svg" alt="Logo" />
        </div>
        <button
          className={`sidebar-toggle ${isCollapsed ? 'sidebar-toggle-collapsed' : ''}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-navigation">
        <ul className="sidebar-menu">
          {navItems.map((item) => (
            <li key={item.path} className="sidebar-menu-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-menu-button ${isActive ? 'active' : ''}`
                }
              >
                <span className="sidebar-icon">{item.icon}</span>
                {!isCollapsed && (
                  <span className="sidebar-label">{item.label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Section */}
      <div className="sidebar-footer">
        {/* User Info Section */}
        <div className="sidebar-user-info">
          <div className="user-avatar">
            <div className="user-profile-image">
              {user?.profile_image ? (
                <img src={user.profile_image} alt="Profile" />
              ) : (
                <AccountCircleIcon />
              )}
            </div>
          </div>
          {!isCollapsed && (
            <div className="user-details">
              <div className="user-name">{getUserDisplayName()}</div>
              <div className="user-role">{getUserRoleDisplay()}</div>
            </div>
          )}
        </div>
        <button
          className="logout-button"
          onClick={onLogout}
          title="Logout"
        >
          <span className="sidebar-icon">
            <LogoutIcon />
          </span>
          {!isCollapsed && (
            <span className="sidebar-label">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;