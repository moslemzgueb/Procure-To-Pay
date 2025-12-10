import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [payments, setPayments] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const [paymentsRes, budgetsRes] = await Promise.all([
                api.get('/payments'),
                api.get('/budgets')
            ]);
            setPayments(paymentsRes.data.data || []);
            setBudgets(budgetsRes.data.data || []);
            setError(null);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
            setPayments([]);
            setBudgets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    // Calculate statistics
    const totalBudgets = budgets.length;
    const pendingBudgets = budgets.filter(b => b.status === 'SUBMITTED').length;
    const approvedBudgets = budgets.filter(b => b.status === 'APPROVED').length;
    const rejectedBudgets = budgets.filter(b => b.status === 'REJECTED').length;
    const totalPayments = payments.length;

    return (
        <div className="app-layout">
            <Sidebar />

            <div className="main-content">
                <Header title="Dashboard" />

                <div style={{ padding: '2rem' }}>
                    {/* Loading State */}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                            <p>Loading dashboard...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                            <p style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>{error}</p>
                            <button className="btn btn-primary" onClick={fetchPayments}>Retry</button>
                        </div>
                    )}

                    {/* Dashboard Content */}
                    {!loading && !error && (
                        <>
                            {/* Statistics Cards */}
                            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div className="card" style={{ padding: '1.5rem' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{totalBudgets}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Budgets</div>
                                </div>
                                <div className="card" style={{ padding: '1.5rem' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning-color)' }}>{pendingBudgets}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Pending Approval</div>
                                </div>
                                <div className="card" style={{ padding: '1.5rem' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>{approvedBudgets}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Approved</div>
                                </div>
                                <div className="card" style={{ padding: '1.5rem' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❌</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger-color)' }}>{rejectedBudgets}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Rejected</div>
                                </div>
                            </div>

                            {/* Recent Payments Table */}
                            <div className="card">
                                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Recent Payments</h2>
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>Invoice #</th>
                                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>Description</th>
                                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>Amount</th>
                                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>Status</th>
                                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>Initiator</th>
                                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                                                        <p style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>No payments yet</p>
                                                        <p style={{ fontSize: '0.875rem' }}>Create your first payment to get started</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                payments.slice(0, 10).map(req => (
                                                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                        <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                                                            {req.invoice_number}
                                                        </td>
                                                        <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '500' }}>{req.product_service_description}</td>
                                                        <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600' }}>
                                                            ${parseFloat(req.amount_local).toLocaleString()} {req.currency}
                                                        </td>
                                                        <td style={{ padding: '1rem' }}>
                                                            <span className={`badge badge-${req.status === 'APPROVED' ? 'success' : req.status === 'REJECTED' ? 'danger' : 'warning'}`}>
                                                                {req.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{req.Initiator?.username}</td>
                                                        <td style={{ padding: '1rem' }}>
                                                            <Link to={`/payments/${req.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                                                View
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
