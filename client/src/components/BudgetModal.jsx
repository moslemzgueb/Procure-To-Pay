import React, { useState, useEffect } from 'react';
import api from '../api';

const BudgetModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        entity_id: '',
        expense_type: '',
        isRecurrent: false,
        vendor_id: '',
        deal_name: '',
        product_service_name: '', // Was description
        country: '', // Was dealCountry
        total_budget_local: '', // Was amountLCY
        total_budget_reporting: '', // Was amountFCY
        documentPath: '',
        askForFinalValidation: false,
        // validator1: '', // specific validators might be handled by engine now
        // validator2: ''
    });

    const [entities, setEntities] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [entityRes, vendorRes] = await Promise.all([
                    api.get('/entities'),
                    api.get('/vendors')
                ]);
                setEntities(entityRes.data);
                setVendors(vendorRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const payload = {
                ...formData,
                one_time_or_recurring: formData.isRecurrent ? 'RECURRING' : 'ONE_TIME',
                initiator_id: 1, // TODO: Get from auth context
                currency: 'USD', // Default or add field
                status: 'DRAFT',
                // Map legacy/UI fields to model
                expense_category: 'General', // Default
                nature: 'Operating', // Default
                budget_source: 'Fund', // Default
            };

            await api.post('/budgets', payload);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating budget:', error);
            setError(error.response?.data?.message || 'Error creating budget');
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
                    marginBottom: '1.5rem'
                }}>
                    {error}
                </div>
            )}

            {/* Budget Details Section */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    Budget Details
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label className="label">Entity *</label>
                        <select
                            name="entity_id"
                            className="input"
                            value={formData.entity_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Entity</option>
                            {entities.map(e => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">Type *</label>
                        <input
                            name="expense_type"
                            className="input"
                            value={formData.expense_type}
                            onChange={handleChange}
                            placeholder="Enter budget type"
                            required
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            padding: '0.75rem',
                            backgroundColor: formData.isRecurrent ? '#ede9fe' : 'transparent',
                            borderRadius: 'var(--radius)',
                            transition: 'background-color 0.2s'
                        }}>
                            <input
                                type="checkbox"
                                name="isRecurrent"
                                checked={formData.isRecurrent}
                                onChange={handleChange}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ fontWeight: '500' }}>Is Recurrent Budget</span>
                        </label>
                    </div>

                    <div>
                        <label className="label">Third-party Provider</label>
                        <select
                            name="vendor_id"
                            className="input"
                            value={formData.vendor_id}
                            onChange={handleChange}
                        >
                            <option value="">Select Vendor (Optional)</option>
                            {vendors.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">Deal Name *</label>
                        <input
                            name="deal_name"
                            className="input"
                            value={formData.deal_name}
                            onChange={handleChange}
                            placeholder="Enter deal name"
                            required
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label className="label">Description</label>
                        <textarea
                            name="product_service_name"
                            className="input"
                            value={formData.product_service_name}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Provide a detailed description..."
                            style={{ resize: 'vertical' }}
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Financial Information Section */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    Financial Information
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label className="label">Deal Country *</label>
                        <input
                            name="country"
                            className="input"
                            value={formData.country}
                            onChange={handleChange}
                            placeholder="e.g., France, USA"
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Amount LCY *</label>
                        <input
                            type="number"
                            name="total_budget_local"
                            className="input"
                            value={formData.total_budget_local}
                            onChange={handleChange}
                            placeholder="0.00"
                            required
                            step="0.01"
                            min="0"
                        />
                    </div>
                    <div>
                        <label className="label">Amount FCY</label>
                        <input
                            type="number"
                            name="total_budget_reporting"
                            className="input"
                            value={formData.total_budget_reporting}
                            onChange={handleChange}
                            placeholder="0.00 (optional)"
                            step="0.01"
                            min="0"
                        />
                    </div>
                    <div>
                        <label className="label">Document Upload</label>
                        <input
                            type="text"
                            name="documentPath"
                            className="input"
                            placeholder="File path or URL..."
                            value={formData.documentPath}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            padding: '0.75rem',
                            backgroundColor: formData.askForFinalValidation ? '#dbeafe' : 'transparent',
                            borderRadius: 'var(--radius)',
                            transition: 'background-color 0.2s'
                        }}>
                            <input
                                type="checkbox"
                                name="askForFinalValidation"
                                checked={formData.askForFinalValidation}
                                onChange={handleChange}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ fontWeight: '500' }}>Ask for final validation</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                >
                    Create Budget
                </button>
            </div>
        </form>
    );
};

export default BudgetModal;
