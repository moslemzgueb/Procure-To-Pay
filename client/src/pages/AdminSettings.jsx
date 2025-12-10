
import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        smtp_host: '',
        smtp_port: '',
        smtp_user: '',
        smtp_password: '', // In real app, might just show "********" or leave empty
        from_email: '',
        enable_notifications: 'false'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/admin/settings');
                // Merge with defaults to ensure all fields exist
                setSettings(prev => ({ ...prev, ...response.data }));
            } catch (error) {
                console.error('Error fetching settings:', error);
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/admin/settings', settings);
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="app-layout">Loading...</div>;

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header title="System Settings" />
                <div style={{ padding: '2rem', maxWidth: '800px' }}>

                    <div className="card" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                            Email Configuration (SMTP)
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="label">Enable Email Notifications</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        name="enable_notifications"
                                        checked={settings.enable_notifications === 'true'}
                                        onChange={handleChange}
                                        style={{ width: '1.2rem', height: '1.2rem' }}
                                    />
                                    <span>Enable system-wide email notifications</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="label">SMTP Host</label>
                                    <input
                                        type="text"
                                        name="smtp_host"
                                        value={settings.smtp_host}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="e.g. smtp.gmail.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">SMTP Port</label>
                                    <input
                                        type="text"
                                        name="smtp_port"
                                        value={settings.smtp_port}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="e.g. 587"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="label">SMTP User</label>
                                    <input
                                        type="text"
                                        name="smtp_user"
                                        value={settings.smtp_user}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="user@example.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">SMTP Password</label>
                                    <input
                                        type="password"
                                        name="smtp_password"
                                        value={settings.smtp_password}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="********"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">From Email Address</label>
                                <input
                                    type="text"
                                    name="from_email"
                                    value={settings.from_email}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="noreply@company.com"
                                />
                                <small style={{ color: 'var(--text-secondary)' }}>
                                    The email address that will appear as the sender.
                                </small>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                    style={{ paddingLeft: '2rem', paddingRight: '2rem' }}
                                >
                                    {saving ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
