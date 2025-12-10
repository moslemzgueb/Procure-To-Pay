import React, { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const ApprovalActions = ({ objectType, objectId, onActionComplete }) => {
    const [loading, setLoading] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [showRequestInfo, setShowRequestInfo] = useState(false);
    const [comment, setComment] = useState('');
    const handleAction = async (action) => {
        setLoading(true);
        try {
            if (action === 'APPROVE') {
                await api.post('/approval/approve', { objectType, objectId });
                toast.success('Successfully approved!');
            } else if (action === 'REJECT') {
                await api.post('/approval/reject', { objectType, objectId, comment });
                toast.success('Successfully rejected.');
            } else if (action === 'REQUEST_INFO') {
                await api.post('/approval/request-info', { objectType, objectId, comment });
                toast.success('Information requested successfully.');
            }

            setComment('');
            setShowReject(false);
            setShowRequestInfo(false);
            if (onActionComplete) onActionComplete();
        } catch (error) {
            console.error(`Error performing ${action}:`, error);
            toast.error(`Failed to ${action.toLowerCase()}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ padding: '1.5rem', marginTop: '1rem', borderTop: '4px solid var(--primary-color)' }}>
            <h4 style={{ marginBottom: '1rem' }}>Approval Actions</h4>

            {!showReject && !showRequestInfo && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn btn-success"
                        onClick={() => handleAction('APPROVE')}
                        disabled={loading}
                        style={{ backgroundColor: 'var(--success-color)', color: 'white' }}
                    >
                        Approve
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={() => setShowReject(true)}
                        disabled={loading}
                        style={{ backgroundColor: 'var(--danger-color)', color: 'white' }}
                    >
                        Reject
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowRequestInfo(true)}
                        disabled={loading}
                    >
                        Request Info
                    </button>
                </div>
            )}

            {(showReject || showRequestInfo) && (
                <div>
                    <label className="label">
                        {showReject ? 'Reason for Rejection' : 'Information Needed'}
                    </label>
                    <textarea
                        className="input"
                        rows="3"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Enter your comments here..."
                    ></textarea>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                        <button
                            className={`btn ${showReject ? 'btn-danger' : 'btn-secondary'}`}
                            onClick={() => handleAction(showReject ? 'REJECT' : 'REQUEST_INFO')}
                            disabled={loading || !comment.trim()}
                        >
                            Confirm {showReject ? 'Reject' : 'Request'}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => { setShowReject(false); setShowRequestInfo(false); }}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApprovalActions;
