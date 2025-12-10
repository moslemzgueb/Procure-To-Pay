import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('initiator');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await register(username, password, role);
        if (result.success) {
            navigate('/login');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div className="logo">P2P</div>
                    <h1>Create Account</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Join the Procure2Pay platform</p>
                </div>

                {error && (
                    <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            className="input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Role</label>
                        <select
                            className="input"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={{ cursor: 'pointer' }}
                        >
                            <option value="initiator">Initiator (Requester)</option>
                            <option value="approver">Approver</option>
                            <option value="finance_admin">Finance Admin</option>
                            <option value="stakeholder">Stakeholder (Read-only)</option>
                            <option value="system_admin">System Admin</option>
                        </select>
                        <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                            Select a role to test different permissions
                        </small>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                        Register
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '500' }}>Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
