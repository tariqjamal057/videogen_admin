import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { LucideIcon } from 'lucide-react';
import {
    LayoutDashboard,
    Layers,
    CreditCard,
    PlayCircle,
    Users,
    FileWarning,
    Receipt,
    Settings,
    LogOut,
    Video,
    Menu,
    X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavItemProps {
    to: string;
    icon: LucideIcon;
    label: string;
    isActive: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, isActive, onClick }) => {
    return (
        <Link to={to} className={`nav-item ${isActive ? 'active' : ''}`} onClick={onClick}>
            <Icon size={20} />
            <span>{label}</span>
        </Link>
    );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/categories', icon: Layers, label: 'Categories' },
        { path: '/plans', icon: CreditCard, label: 'Plans' },
        { path: '/templates', icon: PlayCircle, label: 'Templates' },
        { path: '/users', icon: Users, label: 'Users' },
        { path: '/videos', icon: Video, label: 'Videos' },
        { path: '/reports', icon: FileWarning, label: 'Reports' },
        { path: '/transactions', icon: Receipt, label: 'Transactions' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            <aside className={`sidebar glass ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-glow"></div>
                    <h1>VideoGen <span>Admin</span></h1>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <NavItem
                            key={item.path}
                            to={item.path}
                            icon={item.icon}
                            label={item.label}
                            isActive={location.pathname === item.path}
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="btn-logout" onClick={logout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-bar glass">
                    <div className="top-bar-left">
                        <button className="mobile-toggle" onClick={toggleSidebar}>
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <span className="admin-badge">Super Admin</span>
                    </div>
                    <div className="top-bar-right">
                        <div className="user-profile">
                            <div className="user-avatar">AD</div>
                            <div className="user-info">
                                <span className="user-name">Admin User</span>
                                <span className="user-role">Administrator</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="content-area">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
