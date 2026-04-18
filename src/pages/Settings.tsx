import React, { useState } from 'react';
import { Shield, Key, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleToggleVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (isLoading) return;

        setIsLoading(true);
        const loadingToast = toast.loading('Updating password...');

        try {
            const response = await api.post('/api/v1/admins/auth/change-password', {
                password: formData.currentPassword,
                newPassword: formData.newPassword
            });

            if (response.data.success) {
                toast.success('Password updated successfully!', { id: loadingToast });
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(response.data.message || 'Update failed', { id: loadingToast });
            }
        } catch (error: any) {
            console.error('Change password error:', error);
            const message = error.response?.data?.message || 'Failed to update password. Please check your current password.';
            toast.error(message, { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <div className="header-info">
                    <h2>Account Settings</h2>
                    <p>Manage your administrative security and preferences</p>
                </div>
            </div>

            <div className="settings-grid responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', borderRadius: '0.5rem' }}>
                            <Key size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Change Password</h3>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Ensure your account stays secure by using a strong password</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '400px' }}>

                        <div className="form-group">
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Current Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    className="input-field"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => handleToggleVisibility('current')}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    className="input-field"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => handleToggleVisibility('new')}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Confirm New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    className="input-field"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => handleToggleVisibility('confirm')}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={isLoading}>
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>

                <div className="settings-sidebar">
                    <div className="card glass" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                            <Shield size={18} />
                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Security Tips</span>
                        </div>
                        <ul style={{ listStyle: 'none', fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li>• Use at least 8 characters</li>
                            <li>• Mix uppercase & lowercase</li>
                            <li>• Include numbers or symbols</li>
                            <li>• Don't use your username</li>
                        </ul>
                    </div>
                </div>
            </div>
            <style>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Settings;
