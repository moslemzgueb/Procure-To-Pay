
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ApprovalActions from '../components/ApprovalActions';
import QAPanel from '../components/QAPanel';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

const PaymentDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                const res = await api.get(`/payments/${id}`);
                setPayment(res.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching payment:', error);
                setLoading(false);
                toast.error('Failed to load payment details');
            }
        };
        fetchPayment();
    }, [id]);

    const handleSubmitClick = () => {
        setShowSubmitConfirm(true);
    };

    const confirmSubmit = async () => {
        try {
            setSubmitting(true);
            await api.post(`/payments/${id}/submit`);
            toast.success('Payment submitted for approval');
            // Refresh payment data
            const res = await api.get(`/payments/${id}`);
            setPayment(res.data.data);
        } catch (error) {
            console.error('Error submitting payment:', error);
            toast.error(error.response?.data?.message || 'Failed to submit payment');
        } finally {
            setSubmitting(false);
            setShowSubmitConfirm(false);
        }
    };

    if (loading) return <div className="app-layout">Loading...</div>;
    if (!payment) return <div className="app-layout">Payment not found</div>;

    const budget = payment.Budget;

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header title={`Payment #${payment.invoice_number}`} />

                <div style={{ display: 'flex', gap: '2rem', padding: '2rem' }}>
                    {/* Main Payment Details */}
                    <div style={{ flex: 2 }}>
                        <div className="card" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Invoice Details</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label className="label">Status</label>
                                    <span className={`badge badge-${payment.status === 'APPROVED' ? 'success' :
                                        payment.status === 'REJECTED' ? 'danger' :
                                            payment.status === 'DRAFT' ? 'secondary' : 'warning'
                                        }`}>
                                        {payment.status}
                                    </span>
                                </div>
                                <div>
                                    <label className="label">Amount</label>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                        {parseFloat(payment.amount_local).toLocaleString()} {payment.currency}
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Vendor</label>
                                    <div>{payment.Vendor?.name}</div>
                                </div>
                                <div>
                                    <label className="label">Entity</label>
                                    <div>{payment.Entity?.name}</div>
                                </div>
                                <div>
                                    <label className="label">Invoice Date</label>
                                    <div>{payment.invoice_date}</div>
                                </div>
                                <div>
                                    <label className="label">Description</label>
                                    <div>{payment.product_service_description}</div>
                                </div>
                            </div>

                            {payment.Attachment && (
                                <div style={{ marginTop: '2rem' }}>
                                    <h4>Attachment</h4>
                                    <a href={`http://localhost:3000/${payment.Attachment.file_path}`} target="_blank" rel="noopener noreferrer">
                                        View Invoice
                                    </a>
                                </div>
                            )}

                            {/* Submit Button for DRAFT payments */}
                            {payment.status === 'DRAFT' && (
                                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSubmitClick}
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Submitting...' : 'Submit for Approval'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Budget Context Panel */}
                    {budget && (
                        <div style={{ flex: 1 }}>
                            <div className="card" style={{ padding: '1.5rem', background: '#f8f9fa' }}>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Budget Context</h4>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label className="label">Linked Budget</label>
                                    <Link to={`/budgets/${budget.id}`} style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                        {budget.deal_name || budget.product_service_name}
                                    </Link>
                                </div>

                                <div style={{ marginBottom: '0.5rem' }}>
                                    <label className="label">Remaining Budget</label>
                                    {/* Placeholder as API aggregation might not be here */}
                                    <div>Check Budget View</div>
                                </div>

                                <div style={{ marginBottom: '0.5rem' }}>
                                    <label className="label">Budget Status</label>
                                    <div>{budget.status}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Approval & Q&A Section */}
                <div style={{ padding: '0 2rem 2rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        {payment.status === 'SUBMITTED' && (
                            <ApprovalActions
                                objectType="PaymentRequest"
                                objectId={payment.id}
                                onActionComplete={() => window.location.reload()}
                            />
                        )}
                    </div>
                    <div>
                        <QAPanel objectType="PaymentRequest" objectId={payment.id} />
                    </div>
                </div>

                <ConfirmDialog
                    isOpen={showSubmitConfirm}
                    onClose={() => setShowSubmitConfirm(false)}
                    onConfirm={confirmSubmit}
                    title="Submit Payment"
                    message="Are you sure you want to submit this payment for approval?"
                    confirmText="Submit"
                />
            </div>
        </div>
    );
};

export default PaymentDetail;
