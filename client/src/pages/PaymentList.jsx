
import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

const PaymentList = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aggregations, setAggregations] = useState({ total_amount: 0, count: 0 });
    const [filters, setFilters] = useState({
        status: '',
        entity_id: ''
    });
    const [entities, setEntities] = useState([]);
    const { user } = useAuth();
    const isAdmin = user?.role === 'system_admin';
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    useEffect(() => {
        fetchEntities();
        fetchPayments();
    }, [filters]);

    const fetchEntities = async () => {
        try {
            const response = await api.get('/entities');
            setEntities(response.data);
        } catch (error) {
            console.error('Error fetching entities:', error);
        }
    };

    const fetchPayments = async () => {
        try {
            const query = new URLSearchParams(filters).toString();
            const response = await api.get(`/payments?${query}`);
            setPayments(response.data.data);
            setAggregations(response.data.aggregations);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching payments:', error);
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleExportCSV = () => {
        if (!payments || payments.length === 0) {
            toast.error("No data to export");
            return;
        }

        const headers = ["Invoice #", "Entity", "Vendor", "Description", "Amount", "Status"];
        const rows = payments.map(p => [
            `"${(p.invoice_number || '').replace(/"/g, '""')}"`,
            `"${(p.Entity?.name || '').replace(/"/g, '""')}"`,
            `"${(p.Vendor?.name || '').replace(/"/g, '""')}"`,
            `"${(p.product_service_description || '').replace(/"/g, '""')}"`,
            p.amount_local,
            p.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'payments_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDeleteClick = (paymentId) => {
        setConfirmDeleteId(paymentId);
    };

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;

        try {
            await api.delete(`/payments/${confirmDeleteId}`);
            toast.success('Payment deleted successfully');
            fetchPayments();
        } catch (error) {
            console.error('Error deleting payment:', error);
            toast.error(error.response?.data?.message || 'Failed to delete payment');
        } finally {
            setConfirmDeleteId(null);
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header
                    title="Payments"
                    actions={
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-secondary" onClick={handleExportCSV}>
                                📥 Export CSV
                            </button>
                            <Link to="/payments/upload" className="btn btn-secondary">
                                Batch Upload
                            </Link>
                            <Link to="/payments/new" className="btn btn-primary">
                                + New Payment
                            </Link>
                        </div>
                    }
                />

                <div style={{ padding: '2rem' }}>
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ width: '200px' }}>
                                <label className="label">Entity</label>
                                <select
                                    name="entity_id"
                                    className="input"
                                    value={filters.entity_id}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Entities</option>
                                    {entities.map(e => (
                                        <option key={e.id} value={e.id}>{e.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ width: '200px' }}>
                                <label className="label">Status</label>
                                <select
                                    name="status"
                                    className="input"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="DRAFT">Draft</option>
                                    <option value="SUBMITTED">Submitted</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="card" style={{ padding: '1rem', flex: 1 }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Payment Amount</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                ${aggregations.total_amount.toLocaleString()}
                            </div>
                        </div>
                        <div className="card" style={{ padding: '1rem', flex: 1 }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Payments</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {aggregations.count}
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Invoice #</th>
                                    <th style={{ padding: '1rem' }}>Entity</th>
                                    <th style={{ padding: '1rem' }}>Vendor</th>
                                    <th style={{ padding: '1rem' }}>Description</th>
                                    <th style={{ padding: '1rem' }}>Amount</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                                ) : payments.length === 0 ? (
                                    <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center' }}>No payments found</td></tr>
                                ) : (
                                    payments.map(payment => (
                                        <tr key={payment.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1rem', fontWeight: '500' }}>{payment.invoice_number}</td>
                                            <td style={{ padding: '1rem' }}>{payment.Entity?.name}</td>
                                            <td style={{ padding: '1rem' }}>{payment.Vendor?.name}</td>
                                            <td style={{ padding: '1rem' }}>{payment.product_service_description}</td>
                                            <td style={{ padding: '1rem' }}>${parseFloat(payment.amount_local).toLocaleString()} {payment.currency}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span className={`badge badge-${payment.status === 'APPROVED' ? 'success' :
                                                    payment.status === 'REJECTED' ? 'danger' :
                                                        payment.status === 'DRAFT' ? 'secondary' : 'warning'
                                                    }`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <Link to={`/payments/${payment.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                                        View
                                                    </Link>
                                                    {(isAdmin || payment.status === 'DRAFT') && (
                                                        <button
                                                            className="btn btn-danger"
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                            onClick={() => handleDeleteClick(payment.id)}
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Payment"
                message="Are you sure you want to delete this payment? This action cannot be undone."
                confirmText="Delete"
                isDangerous={true}
            />
        </div>
    );
};

export default PaymentList;
