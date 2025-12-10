import React, { useState, useEffect } from 'react';
import api from '../api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import EntityModal from '../components/EntityModal';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

const EntityList = () => {
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedEntity, setSelectedEntity] = useState(null);
    const { user } = useAuth();
    const isAdmin = user?.role === 'system_admin';

    const fetchEntities = async () => {
        try {
            const response = await api.get('/entities'); // Fetches all by default now (or filtered if I added query params)
            setEntities(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching entities:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntities();
    }, []);

    const handleEdit = (entity) => {
        setSelectedEntity(entity);
        setShowModal(true);
    };

    const handleCreate = () => {
        setSelectedEntity(null);
        setShowModal(true);
    };

    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const handleDeleteClick = (entityId) => {
        setConfirmDeleteId(entityId);
    };

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;

        try {
            await api.delete(`/entities/${confirmDeleteId}`);
            toast.success('Entity deleted successfully');
            fetchEntities();
        } catch (error) {
            console.error('Error deleting entity:', error);
            toast.error(error.response?.data?.message || 'Failed to delete entity');
        } finally {
            setConfirmDeleteId(null);
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header
                    title="Entities"
                    actions={
                        <button className="btn btn-primary" onClick={handleCreate}>
                            + New Entity
                        </button>
                    }
                />

                <div style={{ padding: '2rem' }}>
                    <div className="card">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Name</th>
                                    <th style={{ padding: '1rem' }}>Type</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                                ) : entities.length === 0 ? (
                                    <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>No entities found</td></tr>
                                ) : (
                                    entities.map(entity => (
                                        <tr key={entity.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1rem', fontWeight: '500' }}>{entity.name}</td>
                                            <td style={{ padding: '1rem' }}>{entity.type}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span className={`badge badge-${entity.status === 'ACTIVE' ? 'success' : 'secondary'}`}>
                                                    {entity.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                        onClick={() => handleEdit(entity)}
                                                    >
                                                        Edit
                                                    </button>
                                                    {isAdmin && (
                                                        <button
                                                            className="btn btn-danger"
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                            onClick={() => handleDeleteClick(entity.id)}
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
                    title="Delete Entity"
                    message="Are you sure you want to delete this entity? This action cannot be undone."
                    confirmText="Delete"
                    isDangerous={true}
                />
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedEntity ? 'Edit Entity' : 'New Entity'}
                maxWidth="500px"
            >
                <EntityModal
                    entity={selectedEntity}
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchEntities}
                />
            </Modal>
        </div>
    );
};

export default EntityList;
