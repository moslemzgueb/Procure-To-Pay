import React, { useState, useEffect } from 'react';
import api from '../api';

const RequisitionModal = ({ onClose, onSuccess }) => {
    // Form State
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

    // Lists
    const [budgets, setBudgets] = useState([]);
    const [entities, setEntities] = useState([]);
    const [vendors, setVendors] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [budgetsRes, entitiesRes, vendorsRes] = await Promise.all([
                    api.get('/budgets?status=APPROVED'),
                    api.get('/entities'),
                    api.get('/vendors')
                ]);
                setBudgets(budgetsRes.data.data || budgetsRes.data); // Handle potential pagination structure
                setEntities(entitiesRes.data);
                setVendors(vendorsRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load form data');
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, invoice_attachment: e.target.files[0] }));
    };

    const handleBudgetChange = (e) => {
        const budgetId = e.target.value;
        const budget = budgets.find(b => b.id == budgetId);

        if (budget) {
            setFormData(prev => ({
                ...prev,
                linked_budget_id: budgetId,
                entity_id: budget.entity_id,
                vendor_id: budget.vendor_id,
                currency: budget.currency,
                product_service_description: budget.product_service_name // Pre-fill description
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                linked_budget_id: '',
                entity_id: '',
                vendor_id: '',
                currency: 'USD',
                product_service_description: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

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

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating requisition:', error);
            setError(error.response?.data?.message || 'Error creating requisition');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #ef4444',
                    color: '#991b1b',
                    padding: '1rem',
                    borderRadius: 'var(--radius)',
                    marginBottom: '1rem'
                }}>
                    {error}
                </div>
            )}

            <div className="form-group">
                <label className="label">Budget (Optional)</label>
                <select
                    name="linked_budget_id"
                    className="input"
                    value={formData.linked_budget_id}
                    onChange={handleBudgetChange}
                >
                    <option value="">Select Approved Budget (or leave empty)</option>
                    {budgets.map(b => (
                        <option key={b.id} value={b.id}>
                            {b.deal_name || b.product_service_name} ({b.currency} {b.remaining_budget})
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                    <label className="label">Entity *</label>
                    <select
                        name="entity_id"
                        className="input"
                        value={formData.entity_id}
                        onChange={handleChange}
                        required
                        disabled={!!formData.linked_budget_id}
                    >
                        <option value="">Select Entity</option>
                        {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="label">Vendor *</label>
                    <select
                        name="vendor_id"
                        className="input"
                        value={formData.vendor_id}
                        onChange={handleChange}
                        required
                        disabled={!!formData.linked_budget_id}
                    >
                        <option value="">Select Vendor</option>
                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
                <label className="label">Description *</label>
                <textarea
                    name="product_service_description"
                    className="input"
                    value={formData.product_service_description}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Product or Service Description"
                    required
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                    <label className="label">Invoice Number *</label>
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
                    <label className="label">Invoice Date *</label>
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
                    <label className="label">Period Start</label>
                    <input
                        type="date"
                        name="period_start"
                        className="input"
                        value={formData.period_start}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="label">Period End</label>
                    <input
                        type="date"
                        name="period_end"
                        className="input"
                        value={formData.period_end}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                    <label className="label">Amount *</label>
                    <input
                        type="number"
                        name="amount_local"
                        className="input"
                        value={formData.amount_local}
                        onChange={handleChange}
                        required
                        step="0.01"
                    />
                </div>
                <div>
                    <label className="label">Currency *</label>
                    <select
                        name="currency"
                        className="input"
                        value={formData.currency}
                        onChange={handleChange}
                        required
                        disabled={!!formData.linked_budget_id}
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
                    accept=".pdf,.jpg,.png"
                />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Request'}
                </button>
            </div>
        </form>
    );
};

export default RequisitionModal;
