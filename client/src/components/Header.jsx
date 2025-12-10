import React from 'react';

const Header = ({ title, actions }) => {
    return (
        <div style={{
            background: 'var(--surface-color)',
            borderBottom: '1px solid var(--border-color)',
            padding: '1.5rem 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 50
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                        {title}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Welcome back! Here's what's happening today.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {actions}
                </div>
            </div>
        </div>
    );
};

export default Header;
