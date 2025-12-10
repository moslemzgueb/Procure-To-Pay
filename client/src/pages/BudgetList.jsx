import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import BudgetModal from '../components/BudgetModal';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

const BudgetList = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [aggregations, setAggregations] = useState({ total_amount: 0, count: 0 });
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        entity_id: ''
    });
    const [entities, setEntities] = useState([]);
    const { user } = useAuth();
    const isAdmin = user?.role === 'system_admin';

    useEffect(() => {
        fetchEntities();
        fetchBudgets();
    }, [filters]);

    const fetchEntities = async () => {
        try {
            const response = await api.get('/entities');
            setEntities(response.data);
        } catch (error) {
            console.error('Error fetching entities:', error);
        }
    };

    const fetchBudgets = async () => {
        try {
            const query = new URLSearchParams(filters).toString();
            const response = await api.get(`/budgets?${query}`);
            setBudgets(response.data.data);
            setAggregations(response.data.aggregations);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching budgets:', error);
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const handleDeleteClick = (budgetId) => {
        setConfirmDeleteId(budgetId);
    };

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;

        try {
            await api.delete(`/budgets/${confirmDeleteId}`);
            toast.success('Budget deleted successfully');
            fetchBudgets();
        } catch (error) {
            console.error('Error deleting budget:', error);
            toast.error(error.response?.data?.message || 'Failed to delete budget');
        } finally {
            setConfirmDeleteId(null);
        }
    };

    const handleExportCSV = () => {
        if (!budgets || budgets.length === 0) {
            toast.error("No data to export");
            return;
        }

        // Define headers
        const headers = ["Deal Name", "Entity", "Vendor", "Amount (Local)", "Paid", "Remaining", "Status"];

        // Map data into rows
        const rows = budgets.map(b => [
            `"${(b.deal_name || b.product_service_name || '').replace(/"/g, '""')}"`, // Escape quotes
            `"${(b.Entity?.name || '').replace(/"/g, '""')}"`,
            `"${(b.Vendor?.name || '').replace(/"/g, '""')}"`,
            b.total_budget_local,
            b.total_paid,
            b.remaining_budget,
            b.status
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'budgets_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header
                    title="Budgets"
                    actions={
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-secondary" onClick={handleExportCSV}>
                                📥 Export CSV
                            </button>
                            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                + New Budget
                            </button>
                        </div>
                    }
                />

                <div style={{ padding: '2rem' }}>
                    {/* Filters */}
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label className="label">Search</label>
                                <input
                                    type="text"
                                    name="search"
                                    className="input"
                                    placeholder="Search by deal or product..."
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                />
                            </div>
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
                                    <option value="CLOSED">Closed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Aggregations */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="card" style={{ padding: '1rem', flex: 1 }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Budget Amount</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                ${aggregations.total_amount.toLocaleString()}
                            </div>
                        </div>
                        <div className="card" style={{ padding: '1rem', flex: 1 }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Budgets</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {aggregations.count}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="card" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Deal Name</th>
                                    <th style={{ padding: '1rem' }}>Entity</th>
                                    <th style={{ padding: '1rem' }}>Vendor</th>
                                    <th style={{ padding: '1rem' }}>Amount (Local)</th>
                                    <th style={{ padding: '1rem' }}>Paid</th>
                                    <th style={{ padding: '1rem' }}>Remaining</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="8" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                                ) : budgets.length === 0 ? (
                                    <tr><td colSpan="8" style={{ padding: '2rem', textAlign: 'center' }}>No budgets found</td></tr>
                                ) : (
                                    budgets.map(budget => (
                                        <tr key={budget.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1rem', fontWeight: '500' }}>{budget.deal_name || budget.product_service_name}</td>
                                            <td style={{ padding: '1rem' }}>{budget.Entity?.name}</td>
                                            <td style={{ padding: '1rem' }}>{budget.Vendor?.name}</td>
                                            <td style={{ padding: '1rem' }}>${parseFloat(budget.total_budget_local).toLocaleString()} {budget.currency}</td>
                                            <td style={{ padding: '1rem', color: 'var(--success-color)' }}>${budget.total_paid.toLocaleString()}</td>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>${budget.remaining_budget.toLocaleString()}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span className={`badge badge-${budget.status === 'APPROVED' ? 'success' :
                                                    budget.status === 'REJECTED' ? 'danger' :
                                                        budget.status === 'DRAFT' ? 'secondary' : 'warning'
                                                    }`}>
                                                    {budget.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <Link to={`/budgets/${budget.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                                        View
                                                    </Link>
                                                    {isAdmin && (
                                                        <button
                                                            className="btn btn-danger"
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                            onClick={() => handleDeleteClick(budget.id)}
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

                <ConfirmDialog
                    isOpen={!!confirmDeleteId}
                    onClose={() => setConfirmDeleteId(null)}
                    onConfirm={confirmDelete}
                    title="Delete Budget"
                    message="Are you sure you want to delete this budget? This will also delete all related payment requests."
                    confirmText="Delete"
                    isDangerous={true}
                />
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="New Budget Request"
                maxWidth="800px"
            >
                <BudgetModal
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchBudgets}
                />
            </Modal>
        </div>
    );
};

export default BudgetList;
