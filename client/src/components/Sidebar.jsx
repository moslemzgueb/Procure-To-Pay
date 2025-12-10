
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItemStyle = (path) => ({
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius)',
        color: isActive(path) ? 'var(--primary-color)' : 'var(--text-secondary)',
        background: isActive(path) ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1))' : 'transparent',
        fontWeight: isActive(path) ? '600' : '500',
        fontSize: '0.875rem',
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        textDecoration: 'none',
        transition: 'all 0.2s'
    });

    return (
        <div className="sidebar">
            {/* Logo */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '1.125rem', color: 'var(--text-primary)' }}>
                            Procure2Pay
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Invoicing Admin
                        </div>
                    </div>
                </div>
            </div>

            {/* User Profile */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '1.125rem'
                    }}>
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{user.username}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                            {user.role}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ padding: '1rem' }}>
                {/* Dashboard - Available to all */}
                <Link to="/" style={navItemStyle('/')}>
                    <span style={{ fontSize: '1.25rem' }}>📊</span>
                    Dashboard
                </Link>

                {/* My Tasks - Only for Approvers and System Admins */}
                {(user.role === 'approver' || user.role === 'system_admin') && (
                    <Link to="/my-tasks" style={navItemStyle('/my-tasks')}>
                        <span style={{ fontSize: '1.25rem' }}>✅</span>
                        My Tasks
                    </Link>
                )}

                {/* Budgets - Available to all */}
                <Link to="/budgets" style={navItemStyle('/budgets')}>
                    <span style={{ fontSize: '1.25rem' }}>💰</span>
                    Budgets
                </Link>

                {/* Payments - Available to all */}
                <Link to="/payments" style={navItemStyle('/payments')}>
                    <span style={{ fontSize: '1.25rem' }}>💳</span>
                    Payments
                </Link>

                {/* Master Data Section - Only for Finance Admin and System Admin */}
                {(user.role === 'finance_admin' || user.role === 'system_admin') && (
                    <>
                        <div style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', paddingLeft: '1rem', fontWeight: '600' }}>
                            Master Data
                        </div>

                        <Link to="/entities" style={navItemStyle('/entities')}>
                            <span style={{ fontSize: '1.25rem' }}>🏢</span>
                            Entities
                        </Link>

                        <Link to="/vendors" style={navItemStyle('/vendors')}>
                            <span style={{ fontSize: '1.25rem' }}>🏪</span>
                            Vendors
                        </Link>

                        <Link to="/validators" style={navItemStyle('/validators')}>
                            <span style={{ fontSize: '1.25rem' }}>👥</span>
                            Users
                        </Link>
                    </>
                )}

                {/* Admin Section - Only for System Admin */}
                {user.role === 'system_admin' && (
                    <>
                        <div style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', paddingLeft: '1rem', fontWeight: '600' }}>
                            Administration
                        </div>
                        <Link to="/admin/settings" style={navItemStyle('/admin/settings')}>
                            <span style={{ fontSize: '1.25rem' }}>⚙️</span>
                            Settings
                        </Link>
                    </>
                )}
            </nav>

            {/* Logout Button */}
            <div style={{ position: 'absolute', bottom: '1.5rem', left: '1rem', right: '1rem' }}>
                <button
                    onClick={logout}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    <span style={{ fontSize: '1.125rem' }}>🚪</span>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
