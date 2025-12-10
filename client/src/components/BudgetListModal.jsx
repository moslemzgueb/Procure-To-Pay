import React, { useEffect, useState } from 'react';
import api from '../api';

const BudgetListModal = ({ onClose }) => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBudget, setSelectedBudget] = useState(null);

    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const response = await api.get('/budgets');
                setBudgets(response.data);
            } catch (error) {
                console.error('Error fetching budgets:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBudgets();
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading budgets...</div>;
    }

    if (selectedBudget) {
        return (
            <div>
                <button
                    onClick={() => setSelectedBudget(null)}
                    className="btn btn-secondary"
                    style={{ marginBottom: '1.5rem' }}
                >
                    ← Back to List
                </button>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Budget Details */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                            Budget Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="label">Entity</label>
                                <div style={{ padding: '0.5rem', backgroundColor: 'var(--background-color)', borderRadius: 'var(--radius)' }}>
                                    {selectedBudget.entity}
                                </div>
                            </div>
                            <div>
                                <label className="label">Type</label>
                                <div style={{ padding: '0.5rem', backgroundColor: 'var(--background-color)', borderRadius: 'var(--radius)' }}>
                                    {selectedBudget.type}
                                </div>
                            </div>
                            <div>
                                <label className="label">Deal Name</label>
                                <div style={{ padding: '0.5rem', backgroundColor: 'var(--background-color)', borderRadius: 'var(--radius)' }}>
                                    {selectedBudget.dealName}
                                </div>
                            </div>
                            <div>
                                <label className="label">Deal Country</label>
                                <div style={{ padding: '0.5rem', backgroundColor: 'var(--background-color)', borderRadius: 'var(--radius)' }}>
                                    {selectedBudget.dealCountry}
                                </div>
                            </div>
                            <div>
                                <label className="label">Third-party Provider</label>
                                <div style={{ padding: '0.5rem', backgroundColor: 'var(--background-color)', borderRadius: 'var(--radius)' }}>
                                    {selectedBudget.thirdPartyProvider || '—'}
                                </div>
                            </div>
                            <div>
                                <label className="label">Is Recurrent</label>
                                <div style={{ padding: '0.5rem', backgroundColor: 'var(--background-color)', borderRadius: 'var(--radius)' }}>
                                    {selectedBudget.isRecurrent ? 'Yes' : 'No'}
                                </div>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="label">Description</label>
                                <div style={{ padding: '0.5rem', backgroundColor: 'var(--background-color)', borderRadius: 'var(--radius)', minHeight: '3rem' }}>
                                    {selectedBudget.description || '—'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Information */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                            Financial Information
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="label">Amount LCY</label>
                                <div style={{ padding: '0.5rem', backgroundColor: 'var(--background-color)', borderRadius: 'var(--radius)', fontWeight: '600', color: 'var(--primary-color)' }}>
                                    ${parseFloat(selectedBudget.amountLCY).toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <label className="label">Amount FCY</label>
                                <div style={{ padding: '0.5rem', backgroundColor: 'var(--background-color)', borderRadius: 'var(--radius)' }}>
                                    {selectedBudget.amountFCY ? `$${parseFloat(selectedBudget.amountFCY).toFixed(2)}` : '—'}
                                </div>
                            </div>
                            <div>
                                <label className="label">Document</label>
                                <div style={{ padding: '0.5rem', backgroundColor: 'var(--background-color)', borderRadius: 'var(--radius)' }}>
                                    {selectedBudget.documentPath || '—'}
                                </div>
                            </div>
                            <div>
                                <label className="label">Final Validation</label>
                                <div style={{ padding: '0.5rem', backgroundColor: 'var(--background-color)', borderRadius: 'var(--radius)' }}>
                                    {selectedBudget.askForFinalValidation ? 'Required' : 'Not Required'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Validators */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                            Budget Validators
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="label">Validator 1</label>
                                <div style={{ padding: '0.5rem', backgroundColor: 'var(--background-color)', borderRadius: 'var(--radius)' }}>
                                    {selectedBudget.validator1}
                                </div>
                            </div>
                            <div>
                                <label className="label">Validator 2</label>
                                <div style={{ padding: '0.5rem', backgroundColor: 'var(--background-color)', borderRadius: 'var(--radius)' }}>
                                    {selectedBudget.validator2}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {budgets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No budgets found</p>
                    <p style={{ fontSize: '0.9rem' }}>Create your first budget to get started</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {budgets.map(budget => (
                        <div
                            key={budget.id}
                            className="card"
                            style={{
                                padding: '1.25rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: '1px solid var(--border-color)'
                            }}
                            onClick={() => setSelectedBudget(budget)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary-color)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                                        {budget.dealName}
                                    </h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        {budget.entity} • {budget.type}
                                    </p>
                                </div>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '1rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    backgroundColor: budget.isRecurrent ? '#ede9fe' : '#e0e7ff',
                                    color: budget.isRecurrent ? '#6b21a8' : '#3730a3'
                                }}>
                                    {budget.isRecurrent ? 'Recurrent' : 'One-time'}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Amount LCY:</span>
                                    <div style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                                        ${parseFloat(budget.amountLCY).toFixed(2)}
                                    </div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Country:</span>
                                    <div style={{ fontWeight: '500' }}>{budget.dealCountry}</div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Validators:</span>
                                    <div style={{ fontWeight: '500' }}>{budget.validator1}, {budget.validator2}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BudgetListModal;
