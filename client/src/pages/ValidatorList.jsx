import React, { useState, useEffect } from 'react';
import api from '../api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import ValidatorModal from '../components/ValidatorModal';

const ValidatorList = () => {
    const [validators, setValidators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedValidator, setSelectedValidator] = useState(null);

    const fetchValidators = async () => {
        try {
            const response = await api.get('/validators');
            setValidators(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching validators:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchValidators();
    }, []);

    const handleEdit = (validator) => {
        setSelectedValidator(validator);
        setShowModal(true);
    };

    const handleCreate = () => {
        setSelectedValidator(null);
        setShowModal(true);
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header 
                    title="Validators" 
                    actions={
                        <button className="btn btn-primary" onClick={handleCreate}>
                            + New Validator
                        </button>
                    }
                />

                <div style={{ padding: '2rem' }}>
                    <div className="card">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Name</th>
                                    <th style={{ padding: '1rem' }}>Email</th>
                                    <th style={{ padding: '1rem' }}>Department</th>
                                    <th style={{ padding: '1rem' }}>Level</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                                ) : validators.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>No validators found</td></tr>
                                ) : (
                                    validators.map(v => (
                                        <tr key={v.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1rem', fontWeight: '500' }}>{v.name}</td>
                                            <td style={{ padding: '1rem' }}>{v.email}</td>
                                            <td style={{ padding: '1rem' }}>{v.department}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span className="badge badge-secondary">{v.level}</span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <button 
                                                    className="btn btn-secondary" 
                                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                    onClick={() => handleEdit(v)}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedValidator ? 'Edit Validator' : 'New Validator'}
                maxWidth="600px"
            >
                <ValidatorModal 
                    validator={selectedValidator} 
                    onClose={() => setShowModal(false)} 
                    onSuccess={fetchValidators} 
                />
            </Modal>
        </div>
    );
};

export default ValidatorList;
