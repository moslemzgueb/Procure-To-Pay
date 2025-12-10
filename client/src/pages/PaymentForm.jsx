import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const PaymentForm = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('BUDGETED'); // 'BUDGETED' or 'NON_BUDGETED'
    const [loading, setLoading] = useState(false);

    // Lists
    const [entities, setEntities] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [budgets, setBudgets] = useState([]);

    // Form Data
    const [formData, setFormData] = useState({
        linked_budget_id: '',
        entity_id: '',
        vendor_id: '',
        product_service_description: '',
        invoice_date: new Date().toISOString().split('T')[0],
        invoice_number: '',
        period_start: '',
        period_end: '',
        currency: 'USD',
        amount_local: '',
        invoice_attachment: null
    });

    useEffect(() => {
        fetchEntities();
        fetchVendors();
        fetchBudgets();
    }, []);

    const fetchEntities = async () => {
        try {
            const response = await api.get('/entities');
            setEntities(response.data);
        } catch (error) {
            console.error('Error fetching entities:', error);
        }
    };

    const fetchVendors = async () => {
        try {
            const response = await api.get('/vendors');
            setVendors(response.data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        }
    };

    const fetchBudgets = async () => {
        try {
            const response = await api.get('/budgets?status=APPROVED');
            setBudgets(response.data.data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, invoice_attachment: e.target.files[0] }));
    };

    const handleBudgetSelect = (e) => {
        const budgetId = e.target.value;
        const budget = budgets.find(b => b.id == budgetId);

        if (budget) {
            setFormData(prev => ({
                ...prev,
                linked_budget_id: budgetId,
                entity_id: budget.entity_id,
                vendor_id: budget.vendor_id || '', // Ensure it's a string, not null
                currency: budget.currency,
                product_service_description: budget.product_service_name // Pre-fill description
            }));
        } else {
            setFormData(prev => ({ ...prev, linked_budget_id: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'invoice_attachment') {
                    if (formData[key]) data.append('invoice', formData[key]);
                } else {
                    data.append(key, formData[key]);
                }
            });

            await api.post('/payments', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/payments');
        } catch (error) {
            console.error('Error creating payment:', error);
            alert('Failed to create payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header title="New Payment Request" />

                <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
                    <div className="card" style={{ padding: '2rem' }}>
                        {/* Mode Selection */}
                        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                            <button
                                className={`btn ${mode === 'BUDGETED' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setMode('BUDGETED')}
                            >
                                From Approved Budget
                            </button>
                            <button
                                className={`btn ${mode === 'NON_BUDGETED' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setMode('NON_BUDGETED')}
                            >
                                Non-Budgeted Payment
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {mode === 'BUDGETED' && (
                                <div className="form-group">
                                    <label className="label">Select Budget</label>
                                    <select
                                        name="linked_budget_id"
                                        className="input"
                                        value={formData.linked_budget_id}
                                        onChange={handleBudgetSelect}
                                        required
                                    >
                                        <option value="">Select Approved Budget</option>
                                        {budgets.map(b => (
                                            <option key={b.id} value={b.id}>
                                                {b.deal_name || b.product_service_name} ({b.currency} {b.remaining_budget})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="label">Entity</label>
                                    <select
                                        name="entity_id"
                                        className="input"
                                        value={formData.entity_id}
                                        onChange={handleChange}
                                        disabled={mode === 'BUDGETED'} // Locked if from budget
                                        required
                                    >
                                        <option value="">Select Entity</option>
                                        {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Vendor</label>
                                    <select
                                        name="vendor_id"
                                        className="input"
                                        value={formData.vendor_id}
                                        onChange={handleChange}
                                        disabled={mode === 'BUDGETED'} // Locked if from budget
                                    >
                                        <option value="">Select Vendor</option>
                                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <label className="label">Description</label>
                                <input
                                    type="text"
                                    name="product_service_description"
                                    className="input"
                                    value={formData.product_service_description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div>
                                    <label className="label">Invoice Number</label>
                                    <input
                                        type="text"
                                        name="invoice_number"
                                        className="input"
                                        value={formData.invoice_number}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Invoice Date</label>
                                    <input
                                        type="date"
                                        name="invoice_date"
                                        className="input"
                                        value={formData.invoice_date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div>
                                    <label className="label">Amount</label>
                                    <input
                                        type="number"
                                        name="amount_local"
                                        className="input"
                                        value={formData.amount_local}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Currency</label>
                                    <select
                                        name="currency"
                                        className="input"
                                        value={formData.currency}
                                        onChange={handleChange}
                                        disabled={mode === 'BUDGETED'}
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <label className="label">Invoice Attachment</label>
                                <input
                                    type="file"
                                    className="input"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit Payment Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentForm;
