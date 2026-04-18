import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import Modal from '../components/Modal';
import api from '../api/api';
import toast from 'react-hot-toast';

interface Category {
    _id: string;
    name: string;
    isDeleted: boolean;
    createdAt: string;
}

const Categories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/v1/admins/categories');
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error: any) {
            console.error('Fetch categories error:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch categories');
        } finally {
            setIsLoading(false);
        }
    };


    const handleOpenModal = (category: Category | null = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name });
            setIsModalOpen(true);
        } else {
            setEditingCategory(null);
            setFormData({ name: '' });
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        if (isActionLoading) return;
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setIsActionLoading(true);
        const loadingToast = toast.loading(editingCategory ? 'Updating category...' : 'Creating category...');

        try {
            if (editingCategory) {
                const response = await api.put(`/api/v1/admins/categories/${editingCategory._id}`, formData);
                if (response.data.success) {
                    toast.success('Category updated successfully', { id: loadingToast });
                    fetchCategories();
                    handleCloseModal();
                }
            } else {
                const response = await api.post('/api/v1/admins/categories', formData);
                if (response.data.success) {
                    toast.success('Category created successfully', { id: loadingToast });
                    fetchCategories();
                    handleCloseModal();
                }
            }
        } catch (error: any) {
            console.error('Category action error:', error);
            toast.error(error.response?.data?.message || 'Action failed', { id: loadingToast });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        const loadingToast = toast.loading('Deleting category...');
        try {
            const response = await api.delete(`/api/v1/admins/categories/${id}`);
            if (response.data.success) {
                toast.success('Category deleted successfully', { id: loadingToast });
                fetchCategories();
            }
        } catch (error: any) {
            console.error('Delete category error:', error);
            toast.error(error.response?.data?.message || 'Delete failed', { id: loadingToast });
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <div className="header-info">
                    <h2>Categories</h2>
                    <p>Manage video style categories</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()} disabled={isLoading}>
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            <div className="table-controls">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container">
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
                        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
                        <p>Loading categories...</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((cat) => (
                                    <tr key={cat._id}>
                                        <td>{cat.name}</td>
                                        <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="btn-icon" onClick={() => handleOpenModal(cat)}>
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(cat._id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No categories found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingCategory ? 'Edit Category' : 'Add Category'}
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={handleCloseModal} disabled={isActionLoading}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={isActionLoading}>
                            {isActionLoading && <Loader2 size={16} className="animate-spin" />}
                            {editingCategory ? 'Save Changes' : 'Create Category'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Category Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Cinematic"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            autoFocus
                            disabled={isActionLoading}
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Categories;
