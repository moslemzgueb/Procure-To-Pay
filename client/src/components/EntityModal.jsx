import React, { useState, useEffect } from 'react';
import api from '../api';

const EntityModal = ({ entity, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'FUND',
        status: 'ACTIVE'
    });

    // Approval Configuration State
    const [validators, setValidators] = useState([]);
    const [approvalConfig, setApprovalConfig] = useState({
        step1: { validators: [] }, // Array of validator IDs
        step2: { validators: [] }
    });

    useEffect(() => {
        if (entity) {
            setFormData({
                name: entity.name,
                type: entity.type,
                status: entity.status
            });
            fetchRules(entity.id);
        }
        fetchValidators();
    }, [entity]);

    const fetchValidators = async () => {
        try {
            const response = await api.get('/validators');
            setValidators(response.data);
        } catch (error) {
            console.error('Error fetching validators:', error);
        }
    };

    const fetchRules = async (entityId) => {
        try {
            const response = await api.get(`/approval/rules?entityId=${entityId}`);
            const rules = response.data;

            // Map rules to local state
            const newConfig = { step1: { validators: [] }, step2: { validators: [] } };

            rules.forEach(rule => {
                if (rule.group_number === 1) {
                    newConfig.step1.validators = rule.approvers || [];
                } else if (rule.group_number === 2) {
                    newConfig.step2.validators = rule.approvers || [];
                }
            });
            setApprovalConfig(newConfig);
        } catch (error) {
            console.error('Error fetching rules:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleValidatorChange = (step, index, value) => {
        setApprovalConfig(prev => {
            const newValidators = [...prev[step].validators];
            newValidators[index] = parseInt(value); // Store as integer ID
            return {
                ...prev,
                [step]: { ...prev[step], validators: newValidators }
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let entityId;
            if (entity) {
                await api.put(`/entities/${entity.id}`, formData);
                entityId = entity.id;
            } else {
                const res = await api.post('/entities', formData);
                entityId = res.data.id;
            }

            // Save Approval Rules
            const rulesPayload = [];

            // Step 1
            if (approvalConfig.step1.validators.length > 0) {
                rulesPayload.push({
                    workflow_type: 'BUDGET',
                    group_number: 1,
                    approvers: approvalConfig.step1.validators.filter(v => v), // Filter empty
                    logic: 'OR'
                });
            }

            // Step 2
            if (approvalConfig.step2.validators.length > 0) {
                rulesPayload.push({
                    workflow_type: 'BUDGET',
                    group_number: 2,
                    approvers: approvalConfig.step2.validators.filter(v => v),
                    logic: 'OR'
                });
            }

            if (rulesPayload.length > 0) {
                await api.post('/approval/rules', {
                    entityId: entityId,
                    rules: rulesPayload
                });
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving entity:', error);
            alert(`Failed to save entity: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="label">Entity Name</label>
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
                <label className="label">Type</label>
                <select
                    name="type"
                    className="input"
                    value={formData.type}
                    onChange={handleChange}
                >
                    <option value="FUND">Fund</option>
                    <option value="GP">GP</option>
                    <option value="SPV">SPV</option>
                    <option value="OTHER">Other</option>
                </select>
            </div>

            <div className="form-group">
                <label className="label">Status</label>
                <select
                    name="status"
                    className="input"
                    value={formData.status}
                    onChange={handleChange}
                >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
            </div>

            <hr style={{ margin: '1.5rem 0', border: '0', borderTop: '1px solid var(--border-color)' }} />

            <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Approval Workflow (Budget)</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Configure 2 steps. Each step requires 1 approval from the selected validators (OR logic).
            </p>

            {/* Step 1 */}
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: 'var(--radius)' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Step 1 Validators</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <select
                        className="input"
                        value={approvalConfig.step1.validators[0] || ''}
                        onChange={(e) => handleValidatorChange('step1', 0, e.target.value)}
                    >
                        <option value="">Select Validator 1</option>
                        {validators.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                    <select
                        className="input"
                        value={approvalConfig.step1.validators[1] || ''}
                        onChange={(e) => handleValidatorChange('step1', 1, e.target.value)}
                    >
                        <option value="">Select Validator 2</option>
                        {validators.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Step 2 */}
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: 'var(--radius)' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Step 2 Validators</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <select
                        className="input"
                        value={approvalConfig.step2.validators[0] || ''}
                        onChange={(e) => handleValidatorChange('step2', 0, e.target.value)}
                    >
                        <option value="">Select Validator 1</option>
                        {validators.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                    <select
                        className="input"
                        value={approvalConfig.step2.validators[1] || ''}
                        onChange={(e) => handleValidatorChange('step2', 1, e.target.value)}
                    >
                        <option value="">Select Validator 2</option>
                        {validators.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary">{entity ? 'Update' : 'Create'}</button>
            </div>
        </form>
    );
};

export default EntityModal;
