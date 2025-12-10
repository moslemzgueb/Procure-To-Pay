import React from 'react';

const StatCard = ({ title, value, icon, trend, trendValue, color = 'var(--primary-color)' }) => {
    return (
        <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>
                        {title}
                    </p>
                    <h3 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {value}
                    </h3>
                </div>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '0.75rem',
                    background: `linear-gradient(135deg, ${color}15, ${color}30)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                }}>
                    {icon}
                </div>
            </div>
            {trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: trend === 'up' ? 'var(--success-color)' : 'var(--danger-color)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}>
                        {trend === 'up' ? '↑' : '↓'} {trendValue}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        vs last month
                    </span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
