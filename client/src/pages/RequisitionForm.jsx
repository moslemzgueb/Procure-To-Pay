import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const RequisitionForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/requisitions', { title, description, amount });
            navigate('/');
        } catch (error) {
            console.error('Error creating requisition:', error);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>New Requisition</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="label">Title</label>
                        <input
                            type="text"
                            className="input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Description</label>
                        <textarea
                            className="input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                        />
                    </div>
                    <div>
                        <label className="label">Amount</label>
                        <input
                            type="number"
                            className="input"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn btn-primary">Submit Request</button>
                        <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequisitionForm;
