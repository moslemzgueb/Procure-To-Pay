import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ApprovalActions from '../components/ApprovalActions';
import QAPanel from '../components/QAPanel';

const BudgetForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [entities, setEntities] = useState([]);
    const [vendors, setVendors] = useState([]);

    // Form Data
    const [formData, setFormData] = useState({
        entity_id: '',
        expense_category: '',
        expense_type: '',
        nature: '',
        budget_source: '',
        one_time_or_recurring: 'ONE_TIME',
        frequency: '',
        product_service_name: '',
        deal_name: '',
        vendor_id: '',
        vendor_name: '', // For new vendor
        vendor_country: '', // For new vendor
        country: '',
        currency: 'USD',
        total_budget_local: '',
        attachments: null
    });

    const [isNewVendor, setIsNewVendor] = useState(false);

    useEffect(() => {
        fetchEntities();
        fetchVendors();
        if (isEdit) {
            fetchBudgetDetails();
        }
    }, [id]);

    const fetchEntities = async () => {
        try {
            const response = await api.get('/entities');
            setEntities(response.data);
        } catch (error) {
            console.error('Error fetching entities:', error);
        }
    };

    const fetchVendors = async () => {
        try {
            const response = await api.get('/vendors');
            setVendors(response.data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        }
    };

    const fetchBudgetDetails = async () => {
        try {
            const response = await api.get(`/budgets/${id}`);
            setFormData({
                ...response.data,
                total_budget_local: response.data.total_budget_local || '',
            });

            // If budget is submitted, go directly to review step
            if (response.data.status === 'SUBMITTED') {
                setStep(3);
            }
        } catch (error) {
            console.error('Error fetching budget details:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVendorChange = (e) => {
        const value = e.target.value;
        if (value === 'NEW') {
            setIsNewVendor(true);
            setFormData(prev => ({ ...prev, vendor_id: '' }));
        } else {
            setIsNewVendor(false);
            setFormData(prev => ({ ...prev, vendor_id: value }));
        }
    };

    const handleSubmit = async (status) => {
        setLoading(true);
        try {
            const payload = { ...formData, status };

            if (isEdit) {
                // If editing existing budget, update it
                await api.put(`/budgets/${id}`, payload);

                // If submitting for approval, call submit endpoint
                if (status === 'SUBMITTED') {
                    await api.post(`/budgets/${id}/submit`);
                }
            } else {
                // Creating new budget
                await api.post('/budgets', payload);
            }

            navigate('/budgets');
        } catch (error) {
            console.error('Error saving budget:', error);
            alert(error.response?.data?.message || 'Failed to save budget');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header title={isEdit ? 'Edit Budget' : 'New Budget'} />

                <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
                    {/* Stepper */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <div style={{ fontWeight: step >= 1 ? 'bold' : 'normal', color: step >= 1 ? 'var(--primary-color)' : '#ccc' }}>1. Setup</div>
                        <div style={{ fontWeight: step >= 2 ? 'bold' : 'normal', color: step >= 2 ? 'var(--primary-color)' : '#ccc' }}>2. Details</div>
                        <div style={{ fontWeight: step >= 3 ? 'bold' : 'normal', color: step >= 3 ? 'var(--primary-color)' : '#ccc' }}>3. Review & Action</div>
                    </div>

                    <div className="card" style={{ padding: '2rem' }}>
                        {step === 1 && (
                            <div className="form-group">
                                <h3 style={{ marginBottom: '1.5rem' }}>Budget Setup</h3>

                                <label className="label">Entity</label>
                                <select name="entity_id" className="input" value={formData.entity_id} onChange={handleChange}>
                                    <option value="">Select Entity</option>
                                    {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                    <div>
                                        <label className="label">Expense Category</label>
                                        <input type="text" name="expense_category" className="input" value={formData.expense_category} onChange={handleChange} placeholder="e.g. IT, Legal" />
                                    </div>
                                    <div>
                                        <label className="label">Expense Type</label>
                                        <input type="text" name="expense_type" className="input" value={formData.expense_type} onChange={handleChange} placeholder="e.g. Software, Consulting" />
                                    </div>
                                </div>

                                <div style={{ marginTop: '1rem' }}>
                                    <label className="label">Nature</label>
                                    <input type="text" name="nature" className="input" value={formData.nature} onChange={handleChange} placeholder="e.g. Operating, Deal Cost" />
                                </div>

                                <div style={{ marginTop: '1rem' }}>
                                    <label className="label">Budget Source</label>
                                    <input type="text" name="budget_source" className="input" value={formData.budget_source} onChange={handleChange} placeholder="e.g. Fund Budget" />
                                </div>

                                <div style={{ marginTop: '1rem' }}>
                                    <label className="label">Recurrence</label>
                                    <select name="one_time_or_recurring" className="input" value={formData.one_time_or_recurring} onChange={handleChange}>
                                        <option value="ONE_TIME">One Time</option>
                                        <option value="RECURRING">Recurring</option>
                                    </select>
                                </div>

                                {formData.one_time_or_recurring === 'RECURRING' && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <label className="label">Frequency</label>
                                        <input type="text" name="frequency" className="input" value={formData.frequency} onChange={handleChange} placeholder="e.g. Monthly" />
                                    </div>
                                )}

                                <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                                    <button className="btn btn-primary" onClick={nextStep}>Next</button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="form-group">
                                <h3 style={{ marginBottom: '1.5rem' }}>Budget Details</h3>

                                <label className="label">Product / Service Name</label>
                                <input type="text" name="product_service_name" className="input" value={formData.product_service_name} onChange={handleChange} />

                                <div style={{ marginTop: '1rem' }}>
                                    <label className="label">Deal Name (Optional)</label>
                                    <input type="text" name="deal_name" className="input" value={formData.deal_name} onChange={handleChange} />
                                </div>

                                <div style={{ marginTop: '1rem' }}>
                                    <label className="label">Vendor</label>
                                    <select className="input" value={isNewVendor ? 'NEW' : formData.vendor_id} onChange={handleVendorChange}>
                                        <option value="">Select Vendor</option>
                                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                        <option value="NEW">+ Create New Vendor</option>
                                    </select>
                                </div>

                                {isNewVendor && (
                                    <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '4px', marginTop: '0.5rem' }}>
                                        <label className="label">New Vendor Name</label>
                                        <input type="text" name="vendor_name" className="input" value={formData.vendor_name} onChange={handleChange} />

                                        <label className="label" style={{ marginTop: '0.5rem' }}>Vendor Country</label>
                                        <input type="text" name="vendor_country" className="input" value={formData.vendor_country} onChange={handleChange} />
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                    <div>
                                        <label className="label">Country</label>
                                        <input type="text" name="country" className="input" value={formData.country} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="label">Currency</label>
                                        <select name="currency" className="input" value={formData.currency} onChange={handleChange}>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ marginTop: '1rem' }}>
                                    <label className="label">Total Budget (Local)</label>
                                    <input type="number" name="total_budget_local" className="input" value={formData.total_budget_local} onChange={handleChange} />
                                </div>

                                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <button className="btn btn-secondary" onClick={prevStep}>Back</button>
                                    <button className="btn btn-primary" onClick={nextStep}>Next</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="form-group">
                                <h3 style={{ marginBottom: '1.5rem' }}>Review & Action</h3>

                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>Entity:</strong> {entities.find(e => e.id == formData.entity_id)?.name}
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>Product:</strong> {formData.product_service_name}
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>Amount:</strong> {formData.total_budget_local} {formData.currency}
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>Vendor:</strong> {isNewVendor ? formData.vendor_name : vendors.find(v => v.id == formData.vendor_id)?.name}
                                </div>

                                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-secondary" onClick={prevStep} style={{ marginRight: 'auto' }}>Back</button>
                                    <button className="btn btn-secondary" onClick={() => handleSubmit('DRAFT')} disabled={loading || (isEdit && formData.status !== 'DRAFT')}>
                                        Save as Draft
                                    </button>
                                    <button className="btn btn-primary" onClick={() => handleSubmit('SUBMITTED')} disabled={loading || (isEdit && formData.status !== 'DRAFT')}>
                                        {loading ? 'Submitting...' : 'Submit for Approval'}
                                    </button>
                                </div>

                                {isEdit && (
                                    <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <div>
                                            {formData.status === 'SUBMITTED' && (
                                                <ApprovalActions
                                                    objectType="Budget"
                                                    objectId={id}
                                                    onActionComplete={() => fetchBudgetDetails()}
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <QAPanel objectType="Budget" objectId={id} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetForm;
