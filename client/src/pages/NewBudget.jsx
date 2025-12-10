import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const NewBudget = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        entity: '',
        type: '',
        isRecurrent: false,
        thirdPartyProvider: '',
        dealName: '',
        description: '',
        dealCountry: '',
        amountLCY: '',
        amountFCY: '',
        documentPath: '',
        askForFinalValidation: false,
        validator1: '',
        validator2: ''
    });
    const [validators, setValidators] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchValidators = async () => {
            try {
                const response = await api.get('/budgets/validators');
                setValidators(response.data);
            } catch (error) {
                console.error('Error fetching validators:', error);
            }
        };
        fetchValidators();
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

        if (formData.validator1 === formData.validator2) {
            setError('Validator 1 and Validator 2 must be different.');
            return;
        }

        try {
            await api.post('/budgets', formData);
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.message || 'Error creating budget');
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0', maxWidth: '900px' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    New Budget Request
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Configure a new budget with validators for the approval workflow
                </p>
            </div>

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

            <form onSubmit={handleSubmit}>
                {/* Budget Details Section */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                        Budget Details
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                            <label className="label">Entity *</label>
                            <input
                                name="entity"
                                className="input"
                                value={formData.entity}
                                onChange={handleChange}
                                placeholder="Enter entity name"
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Type *</label>
                            <input
                                name="type"
                                className="input"
                                value={formData.type}
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
                            <input
                                name="thirdPartyProvider"
                                className="input"
                                value={formData.thirdPartyProvider}
                                onChange={handleChange}
                                placeholder="Provider name (optional)"
                            />
                        </div>
                        <div>
                            <label className="label">Deal Name *</label>
                            <input
                                name="dealName"
                                className="input"
                                value={formData.dealName}
                                onChange={handleChange}
                                placeholder="Enter deal name"
                                required
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label className="label">Description</label>
                            <textarea
                                name="description"
                                className="input"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Provide a detailed description of the budget..."
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Financial Information Section */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                        Financial Information
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                            <label className="label">Deal Country *</label>
                            <input
                                name="dealCountry"
                                className="input"
                                value={formData.dealCountry}
                                onChange={handleChange}
                                placeholder="e.g., France, USA"
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Amount LCY *</label>
                            <input
                                type="number"
                                name="amountLCY"
                                className="input"
                                value={formData.amountLCY}
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
                                name="amountFCY"
                                className="input"
                                value={formData.amountFCY}
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

                {/* Budget Validators Section */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        Budget Validators
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        Select two different validators for the budget approval workflow
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                            <label className="label">Validator 1 *</label>
                            <select
                                name="validator1"
                                className="input"
                                value={formData.validator1}
                                onChange={handleChange}
                                required
                                style={{ cursor: 'pointer' }}
                            >
                                <option value="">Select Validator</option>
                                {validators.map(v => (
                                    <option key={v.id} value={v.username}>
                                        {v.username} ({v.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">Validator 2 *</label>
                            <select
                                name="validator2"
                                className="input"
                                value={formData.validator2}
                                onChange={handleChange}
                                required
                                style={{ cursor: 'pointer' }}
                            >
                                <option value="">Select Validator</option>
                                {validators.map(v => (
                                    <option key={v.id} value={v.username}>
                                        {v.username} ({v.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="btn btn-secondary"
                        style={{ minWidth: '120px' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ minWidth: '120px' }}
                    >
                        Create Budget
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewBudget;
