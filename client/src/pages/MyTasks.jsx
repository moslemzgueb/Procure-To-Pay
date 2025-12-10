import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        try {
            const response = await api.get('/tasks/my-tasks');
            setTasks(response.data.tasks || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setLoading(false);
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header title="My Tasks" />

                <div style={{ padding: '2rem' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
                    ) : tasks.length === 0 ? (
                        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                            <h3>No pending tasks</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                You don't have any budgets waiting for your approval.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} waiting for your approval
                            </div>

                            <div className="card">
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                            <th style={{ padding: '1rem' }}>Type</th>
                                            <th style={{ padding: '1rem' }}>Description</th>
                                            <th style={{ padding: '1rem' }}>Entity</th>
                                            <th style={{ padding: '1rem' }}>Amount</th>
                                            <th style={{ padding: '1rem' }}>Initiator</th>
                                            <th style={{ padding: '1rem' }}>Step</th>
                                            <th style={{ padding: '1rem' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks.map(task => {
                                            const isBudget = task.type === 'BUDGET';
                                            const description = isBudget
                                                ? (task.deal_name || task.product_service_name)
                                                : task.product_service_description;
                                            const amount = isBudget
                                                ? task.total_budget_local
                                                : task.amount_local;
                                            const linkPath = isBudget
                                                ? `/budgets/${task.id}`
                                                : `/payments/${task.id}`;

                                            return (
                                                <tr key={`${task.type}-${task.id}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span className={`badge badge-${isBudget ? 'primary' : 'info'}`}>
                                                            {isBudget ? '💰 Budget' : '💳 Payment'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem', fontWeight: '500' }}>
                                                        {description}
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>{task.Entity?.name}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        ${parseFloat(amount).toLocaleString()} {task.currency}
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>{task.Initiator?.username}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span className="badge badge-warning">
                                                            Step {task.waitingForGroup}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <Link
                                                            to={linkPath}
                                                            className="btn btn-primary"
                                                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                        >
                                                            Review & Approve
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyTasks;
