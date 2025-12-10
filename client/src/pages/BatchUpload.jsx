import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const BatchUpload = () => {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [entities, setEntities] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState('');

    useEffect(() => {
        const fetchEntities = async () => {
            try {
                const response = await api.get('/entities');
                setEntities(response.data);
            } catch (error) {
                console.error('Error fetching entities:', error);
            }
        };
        fetchEntities();
    }, []);

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        if (!selectedEntity) {
            alert('Please select an entity for these invoices');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        files.forEach(file => {
            formData.append('invoices', file);
        });
        formData.append('entity_id', selectedEntity);

        try {
            await api.post('/payments/batch', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Batch upload successful! Draft payments created.');
            navigate('/payments');
        } catch (error) {
            console.error('Error uploading batch:', error);
            alert('Batch upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header title="Batch Invoice Upload" />

                <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="label">Select Entity</label>
                            <select
                                className="input"
                                value={selectedEntity}
                                onChange={(e) => setSelectedEntity(e.target.value)}
                            >
                                <option value="">Select Entity</option>
                                {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                            <small style={{ color: '#666' }}>All invoices in this batch will be assigned to this entity initially.</small>
                        </div>

                        <div
                            style={{
                                border: '2px dashed #ccc',
                                borderRadius: '8px',
                                padding: '3rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: '#f9f9f9'
                            }}
                            onClick={() => document.getElementById('fileInput').click()}
                        >
                            <input
                                type="file"
                                id="fileInput"
                                multiple
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                                {files.length > 0 ? `${files.length} files selected` : 'Drag & Drop or Click to Upload Invoices'}
                            </div>
                            <button className="btn btn-secondary">Select Files</button>
                        </div>

                        {files.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <h4>Selected Files:</h4>
                                <ul style={{ paddingLeft: '1.5rem', color: '#555' }}>
                                    {files.map((f, i) => <li key={i}>{f.name}</li>)}
                                </ul>
                            </div>
                        )}

                        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                            <button
                                className="btn btn-primary"
                                onClick={handleUpload}
                                disabled={uploading || files.length === 0}
                            >
                                {uploading ? 'Uploading...' : 'Process Batch'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BatchUpload;
