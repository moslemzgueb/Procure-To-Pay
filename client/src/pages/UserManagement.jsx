import React, { useState, useEffect } from 'react';
import api from '../api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import ValidatorModal from '../components/ValidatorModal';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedValidator, setSelectedValidator] = useState(null);
    const { user } = useAuth();
    const isAdmin = user?.role === 'system_admin';

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEdit = (userData) => {
        // If user has validator profile, edit that
        if (userData.Validator) {
            setSelectedValidator({ ...userData.Validator, role: userData.role });
            setShowModal(true);
        }
    };

    const handleCreate = () => {
        setSelectedValidator(null);
        setShowModal(true);
    };

    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const handleDeleteClick = (userId) => {
        setConfirmDeleteId(userId);
    };

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;

        try {
            await api.delete(`/users/${confirmDeleteId}`);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.response?.data?.message || 'Failed to delete user');
        } finally {
            setConfirmDeleteId(null);
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header
                    title="User Management"
                    actions={
                        <button className="btn btn-primary" onClick={handleCreate}>
                            + New User/Validator
                        </button>
                    }
                />

                <div style={{ padding: '2rem' }}>
                    <div className="card">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Username</th>
                                    <th style={{ padding: '1rem' }}>Email</th>
                                    <th style={{ padding: '1rem' }}>Role</th>
                                    <th style={{ padding: '1rem' }}>Validator Profile</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>No users found</td></tr>
                                ) : (
                                    users.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1rem', fontWeight: '500' }}>{u.username}</td>
                                            <td style={{ padding: '1rem' }}>{u.email || '-'}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span className={`badge badge-${u.role === 'system_admin' ? 'danger' : 'secondary'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {u.Validator ? (
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{u.Validator.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>{u.Validator.level}</div>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#999' }}>No validator profile</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {u.Validator && (
                                                        <button
                                                            className="btn btn-secondary"
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                            onClick={() => handleEdit(u)}
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                    {isAdmin && (
                                                        <button
                                                            className="btn btn-danger"
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                            onClick={() => handleDeleteClick(u.id)}
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <ConfirmDialog
                    isOpen={!!confirmDeleteId}
                    onClose={() => setConfirmDeleteId(null)}
                    onConfirm={confirmDelete}
                    title="Delete User"
                    message="Are you sure you want to delete this user? This action cannot be undone."
                    confirmText="Delete"
                    isDangerous={true}
                />
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
                    onSuccess={fetchUsers}
                />
            </Modal>
        </div>
    );
};

export default UserManagement;
