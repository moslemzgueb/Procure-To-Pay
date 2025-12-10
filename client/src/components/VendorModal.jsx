import React, { useState, useEffect } from 'react';
import api from '../api';

const VendorModal = ({ vendor, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        country: '',
        default_currency: 'USD',
        contact_info: '',
        default_entity_id: ''
    });
    const [entities, setEntities] = useState([]);

    useEffect(() => {
        if (vendor) {
            setFormData(vendor);
        }
        fetchEntities();
    }, [vendor]);

    const fetchEntities = async () => {
        try {
            const response = await api.get('/entities');
            setEntities(response.data);
        } catch (error) {
            console.error('Error fetching entities:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (vendor) {
                await api.put(`/vendors/${vendor.id}`, formData);
            } else {
                await api.post('/vendors', formData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving vendor:', error);
            alert('Failed to save vendor');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="label">Vendor Name</label>
                <input
                    type="text"
                    name="name"
                    className="input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label className="label">Country</label>
                    <input
                        type="text"
                        name="country"
                        className="input"
                        value={formData.country}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="label">Currency</label>
                    <select
                        name="default_currency"
                        className="input"
                        value={formData.default_currency}
                        onChange={handleChange}
                    >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label className="label">Default Entity (Optional)</label>
                <select
                    name="default_entity_id"
                    className="input"
                    value={formData.default_entity_id}
                    onChange={handleChange}
                >
                    <option value="">None</option>
                    {entities.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="label">Contact Info / Metadata</label>
                <textarea
                    name="contact_info"
                    className="input"
                    value={formData.contact_info}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Email, Phone, Payment Terms..."
                />
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary">{vendor ? 'Update' : 'Create'}</button>
            </div>
        </form>
    );
};

export default VendorModal;
