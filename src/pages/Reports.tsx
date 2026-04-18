import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

interface Report {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        image: string;
    };
    videoId: {
        _id: string;
        uuid: string;
    };
    reason: string;
    createdAt: string;
}

const Reports: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/v1/admins/reports');
            if (response.data.success) {
                setReports(response.data.data);
            }
        } catch (error: any) {
            console.error('Fetch reports error:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch reports');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredReports = reports.filter(r =>
        (r.userId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.userId?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.reason || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.videoId?.uuid || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <div className="header-info">
                    <h2>Reports & Issues</h2>
                    <p>Review user flags and content violations</p>
                </div>
            </div>

            <div className="table-controls">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by user, email or reason..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
                    <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
                    <p>Loading reports...</p>
                </div>
            ) : (

                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Video UUID</th>
                                <th>Reason</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.length > 0 ? (
                                filteredReports.map((report) => (
                                    <tr key={report._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <img
                                                    src={report.userId?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(report.userId?.name || 'U')}&background=random`}
                                                    alt=""
                                                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                                                />
                                                <div className="info">
                                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{report.userId?.name || 'Unknown User'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{report.userId?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{report.videoId?.uuid || 'N/A'}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                                <AlertCircle size={14} style={{ color: 'var(--status-error)' }} />
                                                {report.reason}
                                            </div>
                                        </td>
                                        <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No reports found matching your search.
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

export default Reports;
