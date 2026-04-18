import React, { useState, useEffect } from 'react';
import { Search, CreditCard, CheckCircle, XCircle, Clock, RotateCcw, Loader2 } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

interface Transaction {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        image: string;
    };
    planId: {
        _id: string;
        name: string;
        price: number;
        duration: string;
    };
    planName: string;
    amount: number;
    credits: number;
    status: number; // 1: Pending, 2: Completed, 3: Failed, 4: Refunded
    transactionId: string;
    createdAt: string;
}

const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/v1/admins/transactions');
            if (response.data.success) {
                setTransactions(response.data.data);
            }
        } catch (error: any) {
            console.error('Fetch transactions error:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch transactions');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t =>
        (t.userId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.userId?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.transactionId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.planId?.name || t.planName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 1: return <span className="status-badge status-pending"><Clock size={12} /> Pending</span>;
            case 2: return <span className="status-badge status-active"><CheckCircle size={12} /> Success</span>;
            case 3: return <span className="status-badge status-inactive"><XCircle size={12} /> Failed</span>;
            case 4: return <span className="status-badge status-inactive" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)' }}><RotateCcw size={12} /> Refunded</span>;
            default: return null;
        }
    };

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <div className="header-info">
                    <h2>Transactions</h2>
                    <p>Monitor revenue and subscription history</p>
                </div>
            </div>

            <div className="table-controls">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by user, email or transaction ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
                    <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
                    <p>Loading transactions...</p>
                </div>
            ) : (

                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Plan</th>
                                <th>Amount</th>
                                <th>Credits</th>
                                <th>Status</th>
                                <th>Transaction ID</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((t) => (
                                    <tr key={t._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <img
                                                    src={t.userId?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.userId?.name || 'U')}&background=random`}
                                                    alt=""
                                                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                                                />
                                                <div className="info">
                                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.userId?.name || 'Unknown User'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.userId?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="plan-info">
                                                <div style={{ fontWeight: 600 }}>{t.planId?.name || t.planName}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {t.planId?.duration ? `${t.planId.duration}` : ''}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 700 }}>₹{t.amount}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-primary)' }}>
                                                <CreditCard size={14} />
                                                {t.credits}
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(t.status)}</td>
                                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{t.transactionId}</td>
                                        <td>{new Date(t.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No transactions found matching your search.
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

export default Transactions;
