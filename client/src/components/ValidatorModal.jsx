import React, { useState, useEffect } from 'react';
import api from '../api';

const ValidatorModal = ({ validator, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        phone: '',
        department: '',
        level: 'Level 1',
        role: 'approver'
    });

    useEffect(() => {
        if (validator) {
            setFormData({ ...validator, role: validator.role || 'approver' }); // Assuming validator object might have role merged or we need to fetch it
        }
    }, [validator]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (validator) {
                response = await api.put(`/validators/${validator.id}`, formData);
            } else {
                response = await api.post('/validators', formData);

                // Show login credentials for new validator
                if (response.data.loginCredentials) {
                    alert(`✅ Validator created successfully!\n\n` +
                        `Login Credentials:\n` +
                        `Username: ${response.data.loginCredentials.username}\n` +
                        `Password: ${response.data.loginCredentials.password}\n\n` +
                        `Please share these credentials with the validator.`);
                }
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving validator:', error);
            alert(`Failed to save validator: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="label">Full Name</label>
                <input
                    type="text"
                    name="name"
                    className="input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label className="label">Email (Login Username)</label>
                <input
                    type="email"
                    name="email"
                    className="input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                {!validator && <small style={{ color: '#666' }}>A user account will be created with default password 'password123'</small>}
            </div>

            <div className="form-group">
                <label className="label">Address</label>
                <input
                    type="text"
                    name="address"
                    className="input"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street, City, Country"
                />
            </div>

            <div className="form-group">
                <label className="label">Phone</label>
                <input
                    type="text"
                    name="phone"
                    className="input"
                    value={formData.phone}
                    onChange={handleChange}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label className="label">Department</label>
                    <input
                        type="text"
                        name="department"
                        className="input"
                        value={formData.department}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label className="label">Role</label>
                    <select
                        name="role"
                        className="input"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="initiator">Initiator</option>
                        <option value="approver">Approver</option>
                        <option value="finance_admin">Finance Admin</option>
                        <option value="system_admin">System Admin</option>
                    </select>
                </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary">{validator ? 'Update' : 'Create'}</button>
            </div>
        </form>
    );
};

export default ValidatorModal;
