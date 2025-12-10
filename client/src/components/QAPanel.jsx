import React, { useState, useEffect } from 'react';
import api from '../api';

const QAPanel = ({ objectType, objectId }) => {
    const [threads, setThreads] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchQA();
    }, [objectType, objectId]);

    const fetchQA = async () => {
        try {
            const response = await api.get(`/approval/qa?objectType=${objectType}&objectId=${objectId}`);
            setThreads(response.data);
        } catch (error) {
            console.error('Error fetching QA:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const response = await api.post('/approval/qa', {
                objectType,
                objectId,
                content: newComment
            });
            setThreads([...threads, response.data]);
            setNewComment('');
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Q&A / Comments</h4>

            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {threads.length === 0 && <div style={{ color: '#888', fontStyle: 'italic' }}>No comments yet.</div>}

                {threads.map(thread => (
                    <div key={thread.id} style={{ background: '#f1f3f5', padding: '0.75rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <strong style={{ fontSize: '0.85rem' }}>{thread.Author?.username || 'User'}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#666' }}>
                                {new Date(thread.createdAt).toLocaleString()}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>{thread.content}</div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    className="input"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ask a question or add a comment..."
                    disabled={loading}
                />
                <button type="submit" className="btn btn-secondary" disabled={loading || !newComment.trim()}>
                    Post
                </button>
            </form>
        </div>
    );
};

export default QAPanel;
