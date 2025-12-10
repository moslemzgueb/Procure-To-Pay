import React, { useState, useEffect } from 'react';
import api from '../api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import VendorModal from '../components/VendorModal';

const VendorList = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);

    const fetchVendors = async () => {
        try {
            const response = await api.get('/vendors');
            setVendors(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching vendors:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleEdit = (vendor) => {
        setSelectedVendor(vendor);
        setShowModal(true);
    };

    const handleCreate = () => {
        setSelectedVendor(null);
        setShowModal(true);
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header
                    title="Vendors"
                    actions={
                        <button className="btn btn-primary" onClick={handleCreate}>
                            + New Vendor
                        </button>
                    }
                />

                <div style={{ padding: '2rem' }}>
                    <div className="card">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Name</th>
                                    <th style={{ padding: '1rem' }}>Country</th>
                                    <th style={{ padding: '1rem' }}>Currency</th>
                                    <th style={{ padding: '1rem' }}>Contact</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                                ) : vendors.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>No vendors found</td></tr>
                                ) : (
                                    vendors.map(vendor => (
                                        <tr key={vendor.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1rem', fontWeight: '500' }}>{vendor.name}</td>
                                            <td style={{ padding: '1rem' }}>{vendor.country}</td>
                                            <td style={{ padding: '1rem' }}>{vendor.default_currency}</td>
                                            <td style={{ padding: '1rem' }}>{vendor.contact_info || '-'}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                    onClick={() => handleEdit(vendor)}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedVendor ? 'Edit Vendor' : 'New Vendor'}
                maxWidth="600px"
            >
                <VendorModal
                    vendor={selectedVendor}
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchVendors}
                />
            </Modal>
        </div>
    );
};

export default VendorList;
