import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, ExternalLink, Search, Trash2, Loader2 } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

interface Video {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        image: string;
    };
    templateId: {
        _id: string;
        name: string;
        prompt: string;
        image: string;
    };
    templateName: string;
    prompt: string;
    progress: number;
    status: number; // 1: pending, 2: generated, 3: failed
    createdAt: string;
    url?: string;
}

const Videos: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/v1/admins/videos');
            if (response.data.success) {
                setVideos(response.data.data);
            }
        } catch (error: any) {
            console.error('Fetch videos error:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch videos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this video record?')) return;

        const loadingToast = toast.loading('Deleting video record...');
        try {
            const response = await api.delete(`/api/v1/admins/videos/${id}`);
            if (response.data.success) {
                toast.success('Video record deleted successfully', { id: loadingToast });
                fetchVideos();
            }
        } catch (error: any) {
            console.error('Delete video error:', error);
            toast.error(error.response?.data?.message || 'Delete failed', { id: loadingToast });
        }
    };

    const filteredVideos = videos.filter(v =>
        (v.userId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.userId?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.prompt || v.templateId?.prompt || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.templateId?.name || v.templateName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 1:
                return <span className="status-badge status-pending"><Clock size={12} /> Pending</span>;
            case 2:
                return <span className="status-badge status-active"><CheckCircle size={12} /> Generated</span>;
            case 3:
                return <span className="status-badge status-inactive"><XCircle size={12} /> Failed</span>;
            default:
                return null;
        }
    };

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <div className="header-info">
                    <h2>Video Generations</h2>
                    <p>Monitor real-time AI video generation tasks</p>
                </div>
            </div>

            <div className="table-controls">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by user, prompt or template..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
                    <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
                    <p>Loading video records...</p>
                </div>
            ) : (

                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User / Template</th>
                                <th>Prompt</th>
                                <th>Progress</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVideos.length > 0 ? (
                                filteredVideos.map((v) => (
                                    <tr key={v._id}>
                                        <td>
                                            <div className="video-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <img
                                                    src={v.userId?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.userId?.name || 'U')}&background=random`}
                                                    alt=""
                                                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                                                />
                                                <div className="info">
                                                    <div className="user" style={{ fontWeight: 600, fontSize: '0.875rem' }}>{v.userId?.name || 'Unknown User'}</div>
                                                    <div className="template" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.templateId?.name || v.templateName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="prompt-cell" title={v.prompt || v.templateId?.prompt} style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.875rem' }}>
                                                {v.prompt || v.templateId?.prompt || 'No prompt provided'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="progress-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '120px' }}>
                                                <div className="progress-bar" style={{ flex: 1, height: '6px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
                                                    <div className="progress-fill" style={{ height: '100%', background: 'var(--accent-primary)', width: `${v.progress}%`, transition: 'width 0.5s ease' }}></div>
                                                </div>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{Math.round(v.progress)}%</span>
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(v.status)}</td>
                                        <td>{new Date(v.createdAt).toLocaleString()}</td>
                                        <td>
                                            <div className="action-btns">
                                                {v.url && (
                                                    <a href={v.url} target="_blank" rel="noopener noreferrer" className="btn-icon" title="View Video">
                                                        <ExternalLink size={16} />
                                                    </a>
                                                )}
                                                <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(v._id)} title="Delete Record">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No video records found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

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

export default Videos;
