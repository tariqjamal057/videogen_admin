import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, CreditCard, UserX, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import Modal from '../components/Modal';
import api from '../api/api';
import toast from 'react-hot-toast';

interface User {
    _id: string;
    name: string;
    email: string;
    profilePicture: string;
    credits: number;
    isDeleted: boolean;
    isSuspended: boolean;
    createdAt: string;
}

const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        credits: 0,
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/v1/admins/users');
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error: any) {
            console.error('Fetch users error:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (user: User | null = null) => {
        setEditingUser(user);
        setFormData({
            name: user ? user.name : '',
            email: user ? user.email : '',
            credits: user ? user.credits : 0,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (isActionLoading) return;
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setIsActionLoading(true);
        const loadingToast = toast.loading('Updating user credits...');

        try {
            const response = await api.put(`/api/v1/admins/users/${editingUser._id}`, {
                credits: formData.credits
            });
            if (response.data.success) {
                toast.success('User updated successfully', { id: loadingToast });
                fetchUsers();
                handleCloseModal();
            }
        } catch (error: any) {
            console.error('Update user error:', error);
            toast.error(error.response?.data?.message || 'Update failed', { id: loadingToast });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleToggleStatus = async (id: string, currentSuspension: boolean) => {
        const action = currentSuspension ? 'activate' : 'suspend';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        const loadingToast = toast.loading(`${action === 'activate' ? 'Activating' : 'Suspending'} user...`);
        try {
            const response = await api.put(`/api/v1/admins/users/suspend-activate/${id}`);
            if (response.data.success) {
                toast.success(`User ${action}d successfully`, { id: loadingToast });
                fetchUsers();
            }
        } catch (error: any) {
            console.error('Toggle status error:', error);
            toast.error(error.response?.data?.message || 'Status update failed', { id: loadingToast });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;

        const loadingToast = toast.loading('Deleting user...');
        try {
            const response = await api.delete(`/api/v1/admins/users/${id}`);
            if (response.data.success) {
                toast.success('User deleted successfully', { id: loadingToast });
                fetchUsers();
            }
        } catch (error: any) {
            console.error('Delete user error:', error);
            toast.error(error.response?.data?.message || 'Delete failed', { id: loadingToast });
        }
    };

    const filteredUsers = users.filter(u =>
        (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <div className="header-info">
                    <h2>Users Management</h2>
                    <p>Monitor user activity and credit balances</p>
                </div>
            </div>

            <div className="table-controls">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
                    <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
                    <p>Loading users...</p>
                </div>
            ) : (
                <>
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Credits</th>
                                    <th>Joined</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id}>
                                            <td>
                                                <div className="user-info-cell" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} alt="" style={{ width: '40px', height: '40px', borderRadius: '999px', border: '2px solid var(--border-color)' }} />
                                                    <div className="text">
                                                        <div className="name" style={{ fontWeight: 600 }}>{user.name}</div>
                                                        <div className="email" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="credit-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.05)', color: 'var(--accent-primary)', padding: '0.25rem 0.625rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                                                    <CreditCard size={14} />
                                                    {user.credits}
                                                </div>
                                            </td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`status-badge ${user.isSuspended ? 'status-inactive' : 'status-active'}`}>
                                                    {user.isSuspended ? 'Suspended' : 'Active'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <button className="btn-icon" onClick={() => handleOpenModal(user)} title="Edit Credits">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    <button className={`btn-icon ${user.isSuspended ? 'btn-icon-success' : 'btn-icon-warning'}`} onClick={() => handleToggleStatus(user._id, user.isSuspended)} title={user.isSuspended ? "Activate User" : "Suspend User"}>
                                                        {user.isSuspended ? <CheckCircle size={16} /> : <UserX size={16} />}
                                                    </button>
                                                    <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(user._id)} title="Delete User">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Modal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        title={editingUser ? 'Edit User Credits' : 'User Details'}
                        footer={
                            <>
                                <button className="btn btn-secondary" onClick={handleCloseModal} disabled={isActionLoading}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSubmit} disabled={isActionLoading}>
                                    {isActionLoading && <Loader2 size={16} className="animate-spin" />}
                                    Save Changes
                                </button>
                            </>
                        }
                    >
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email Address</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    disabled={!!editingUser}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Credit Balance</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={formData.credits}
                                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                                    required
                                    disabled={isActionLoading}
                                />
                            </div>
                        </form>
                    </Modal>
                </>
            )}

            <style>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .btn-icon-success:hover { color: var(--status-success); background: rgba(16, 185, 129, 0.1); }
                .btn-icon-warning:hover { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
            `}</style>
        </div>
    );
};

export default Users;
