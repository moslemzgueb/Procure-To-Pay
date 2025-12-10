
import React, { useEffect, useState } from 'react';
import api from '../api';
import ConfirmDialog from './ConfirmDialog';

const ValidatorListModal = ({ onClose }) => {
    const [validators, setValidators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const fetchValidators = async () => {
        try {
            const response = await api.get('/validators');
            setValidators(response.data);
        } catch (error) {
            console.error('Error fetching validators:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchValidators();
    }, []);

    const handleDeleteClick = (id) => {
        setConfirmDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;

        try {
            await api.delete(`/validators/${confirmDeleteId}`);
            fetchValidators();
        } catch (error) {
            console.error('Error deleting validator:', error);
        } finally {
            setConfirmDeleteId(null);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading validators...</div>;
    }

    return (
        <div>
            {validators.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No validators found</p>
                    <p style={{ fontSize: '0.9rem' }}>Create your first validator to get started</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {validators.map(validator => (
                        <div
                            key={validator.id}
                            className="card"
                            style={{
                                padding: '1.25rem',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                                        {validator.name}
                                    </h4>
                                    <span className={`badge badge-${validator.level === 'Senior' ? 'success' :
                                        validator.level === 'Level 2' ? 'info' : 'warning'
                                        }`}>
                                        {validator.level}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    <div>
                                        <span style={{ fontWeight: '500' }}>Email:</span> {validator.email}
                                    </div>
                                    {validator.department && (
                                        <div>
                                            <span style={{ fontWeight: '500' }}>Department:</span> {validator.department}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteClick(validator.id)}
                                className="btn btn-secondary"
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.875rem',
                                    color: 'var(--danger-color)',
                                    borderColor: 'var(--danger-color)'
                                }}
                            >
                                Deactivate
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={confirmDelete}
                title="Deactivate Validator"
                message="Are you sure you want to deactivate this validator?"
                confirmText="Deactivate"
                isDangerous={true}
            />
        </div>
    );
};

export default ValidatorListModal;
