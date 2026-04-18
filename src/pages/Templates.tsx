import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, ImageIcon, Loader2, Upload } from 'lucide-react';
import Modal from '../components/Modal';
import api from '../api/api';
import toast from 'react-hot-toast';

interface Template {
    _id: string;
    categoryId: string | {
        _id: string;
        categoryName?: string;
        name?: string;
    };
    categoryName?: string;
    name: string;
    description: string;
    prompt: string;
    image: string;
    inputType: string;
    noOfInput: number;
}

interface Category {
    _id: string;
    name: string;
}

const Templates: React.FC = () => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const [templates, setTemplates] = useState<Template[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        description: '',
        prompt: '',
        image: '',
        inputType: 'image',
        noOfInput: 1,
    });

    useEffect(() => {
        fetchTemplates();
        fetchCategories();
    }, []);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/v1/admins/templates');
            if (response.data.success) {
                setTemplates(response.data.data);
            }
        } catch (error: any) {
            console.error('Fetch templates error:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch templates');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/api/v1/admins/categories');
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Fetch categories error:', error);
        }
    };


    const handleOpenModal = (template: Template | null = null) => {
        setImageFile(null);
        if (template) {
            setEditingTemplate(template);

            // Robust category ID extraction
            const categoryId = typeof template.categoryId === 'object'
                ? template.categoryId._id
                : template.categoryId;

            setFormData({
                name: template.name,
                categoryId: categoryId,
                description: template.description,
                prompt: template.prompt,
                image: template.image,
                inputType: template.inputType,
                noOfInput: template.noOfInput,
            });

            // Set preview
            if (template.image) {
                const isExternal = template.image.startsWith('http://') || template.image.startsWith('https://');
                setImagePreview(isExternal ? template.image : `${baseURL}${template.image.startsWith('/') ? '' : '/'}${template.image}`);
            } else {
                setImagePreview(null);
            }

            setIsModalOpen(true);
        } else {
            setEditingTemplate(null);
            setFormData({
                name: '',
                categoryId: '',
                description: '',
                prompt: '',
                image: '',
                inputType: 'image',
                noOfInput: 1,
            });
            setImagePreview(null);
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        if (isActionLoading) return;
        setIsModalOpen(false);
        setEditingTemplate(null);
        setImageFile(null);
        setImagePreview(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsActionLoading(true);
        const loadingToast = toast.loading(editingTemplate ? 'Updating template...' : 'Creating template...');

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('categoryId', formData.categoryId);
            submitData.append('description', formData.description);
            submitData.append('prompt', formData.prompt);
            submitData.append('inputType', formData.inputType);
            submitData.append('noOfInput', formData.noOfInput.toString());

            if (imageFile) {
                submitData.append('image', imageFile);
            } else if (editingTemplate) {
                submitData.append('image', formData.image);
            }

            if (editingTemplate) {
                const response = await api.put(`/api/v1/admins/templates/${editingTemplate._id}`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (response.data.success) {
                    toast.success('Template updated successfully', { id: loadingToast });
                    fetchTemplates();
                    handleCloseModal();
                }
            } else {
                const response = await api.post('/api/v1/admins/templates', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (response.data.success) {
                    toast.success('Template created successfully', { id: loadingToast });
                    fetchTemplates();
                    handleCloseModal();
                }
            }
        } catch (error: any) {
            console.error('Template action error:', error);
            toast.error(error.response?.data?.message || 'Action failed', { id: loadingToast });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;

        const loadingToast = toast.loading('Deleting template...');
        try {
            const response = await api.delete(`/api/v1/admins/templates/${id}`);
            if (response.data.success) {
                toast.success('Template deleted successfully', { id: loadingToast });
                fetchTemplates();
            }
        } catch (error: any) {
            console.error('Delete template error:', error);
            toast.error(error.response?.data?.message || 'Delete failed', { id: loadingToast });
        }
    };

    const filteredTemplates = templates.filter(t => {
        const catName = typeof t.categoryId === 'object'
            ? (t.categoryId.categoryName || t.categoryId.name)
            : (t.categoryName || '');

        return t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (catName || '').toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <div className="header-info">
                    <h2>Video Templates</h2>
                    <p>Manage AI generation presets and inputs</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()} disabled={isLoading}>
                    <Plus size={18} />
                    New Template
                </button>
            </div>

            <div className="table-controls">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
                    <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
                    <p>Loading templates...</p>
                </div>
            ) : (
                <div className="templates-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredTemplates.length > 0 ? (
                        filteredTemplates.map((template) => (
                            <div key={template._id} className="template-row card" style={{ padding: '1.25rem' }}>
                                <div className="template-preview" style={{ position: 'relative', overflow: 'hidden', borderRadius: '0.5rem', aspectRatio: '16/9' }}>
                                    <img
                                        src={(template.image.startsWith('http://') || template.image.startsWith('https://')) ? template.image : `${baseURL}${template.image.startsWith('/') ? '' : '/'}${template.image}`}
                                        alt={template.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div className="preview-overlay">
                                        <ImageIcon size={20} />
                                    </div>
                                </div>

                                <div className="template-info" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div className="info-main">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{template.name}</h3>
                                            <span className="category-tag" style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '999px', color: 'var(--text-secondary)' }}>
                                                {typeof template.categoryId === 'object'
                                                    ? (template.categoryId.categoryName || template.categoryId.name)
                                                    : (template.categoryName || 'Uncategorized')}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{template.description}</p>
                                        <div style={{
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            borderLeft: '2px solid var(--accent-primary)',
                                            fontSize: '0.8125rem',
                                            color: 'var(--accent-primary)',
                                            fontFamily: 'monospace',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            maxHeight: '120px',
                                            overflowY: 'auto',
                                            lineHeight: '1.4'
                                        }}>
                                            <code>{template.prompt}</code>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                        <div style={{ fontSize: '0.8125rem' }}>
                                            <span style={{ color: 'var(--text-muted)', marginRight: '0.25rem' }}>Input:</span>
                                            <span style={{ fontWeight: 600 }}>{template.inputType} ({template.noOfInput})</span>
                                        </div>
                                        <div className="action-btns">
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal(template)}>
                                                <Edit2 size={14} /> Edit
                                            </button>
                                            <button className="btn btn-secondary btn-sm btn-icon-danger" onClick={() => handleDelete(template._id)}>
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
                            No templates found.
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingTemplate ? 'Edit Template' : 'Add New Template'}
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={handleCloseModal} disabled={isActionLoading}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={isActionLoading}>
                            {isActionLoading && <Loader2 size={16} className="animate-spin" />}
                            {editingTemplate ? 'Save Changes' : 'Create Template'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Name</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                disabled={isActionLoading}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Category</label>
                            <select
                                className="input-field"
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                required
                                disabled={isActionLoading}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Description</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            disabled={isActionLoading}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Prompt Preset</label>
                        <textarea
                            className="input-field"
                            style={{ minHeight: '80px', resize: 'vertical' }}
                            value={formData.prompt}
                            onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                            required
                            disabled={isActionLoading}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Template Preview Image</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {imagePreview && (
                                <div style={{
                                    width: '100%',
                                    maxWidth: '200px',
                                    aspectRatio: '16/9',
                                    borderRadius: '0.5rem',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-tertiary)'
                                }}>
                                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                            <div className="file-input-wrapper" style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        opacity: 0,
                                        cursor: 'pointer',
                                        zIndex: 2
                                    }}
                                    disabled={isActionLoading}
                                />
                                <div className="input-field" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    color: 'var(--text-muted)',
                                    minHeight: '42px'
                                }}>
                                    <Upload size={18} />
                                    <span>{imageFile ? imageFile.name : (editingTemplate ? 'Change image...' : 'Choose image...')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Input Type</label>
                            <select
                                className="input-field"
                                value={formData.inputType}
                                onChange={(e) => setFormData({ ...formData, inputType: e.target.value })}
                                disabled={isActionLoading}
                            >
                                <option value="image">Image</option>
                                <option value="text">Text</option>
                                <option value="audio">Audio</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>No. of Inputs</label>
                            <input
                                type="number"
                                className="input-field"
                                value={formData.noOfInput}
                                onChange={(e) => setFormData({ ...formData, noOfInput: parseInt(e.target.value) })}
                                required
                                disabled={isActionLoading}
                            />
                        </div>
                    </div>
                </form>
            </Modal>

            <style>{`
        .template-row {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 2rem;
        }
        .btn-sm { padding: 0.5rem 0.75rem; font-size: 0.8125rem; }
        .preview-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: var(--transition-fast);
        }
        .template-preview:hover .preview-overlay { opacity: 1; }
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

export default Templates;
