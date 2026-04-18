import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, Loader2 } from 'lucide-react';
import Modal from '../components/Modal';
import api from '../api/api';
import toast from 'react-hot-toast';

interface Plan {
    _id: string;
    name: string;
    bulletPoints: string[];
    credits: number;
    amount: number;
    mostPopular: boolean;
    bestValue: boolean;
    playStorePlanId: string;
    isDeleted: boolean;
}

const Plans: React.FC = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        amount: 0,
        credits: 0,
        playStorePlanId: '',
        bulletPoints: '',
        mostPopular: false,
        bestValue: false,
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/v1/admins/plans');
            if (response.data.success) {
                setPlans(response.data.data);
            }
        } catch (error: any) {
            console.error('Fetch plans error:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch plans');
        } finally {
            setIsLoading(false);
        }
    };


    const handleOpenModal = (plan: Plan | null = null) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                name: plan.name,
                amount: plan.amount,
                credits: plan.credits,
                playStorePlanId: plan.playStorePlanId,
                bulletPoints: plan.bulletPoints.join(', '),
                mostPopular: plan.mostPopular || false,
                bestValue: plan.bestValue || false,
            });
            setIsModalOpen(true);
        } else {
            setEditingPlan(null);
            setFormData({
                name: '',
                amount: 0,
                credits: 0,
                playStorePlanId: '',
                bulletPoints: '',
                mostPopular: false,
                bestValue: false,
            });
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        if (isActionLoading) return;
        setIsModalOpen(false);
        setEditingPlan(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const planData = {
            ...formData,
            bulletPoints: formData.bulletPoints.split(',').map(s => s.trim()).filter(s => s !== ''),
        };

        setIsActionLoading(true);
        const loadingToast = toast.loading(editingPlan ? 'Updating plan...' : 'Creating plan...');

        try {
            if (editingPlan) {
                const response = await api.put(`/api/v1/admins/plans/${editingPlan._id}`, planData);
                if (response.data.success) {
                    toast.success('Plan updated successfully', { id: loadingToast });
                    fetchPlans();
                    handleCloseModal();
                }
            } else {
                const response = await api.post('/api/v1/admins/plans', planData);
                if (response.data.success) {
                    toast.success('Plan created successfully', { id: loadingToast });
                    fetchPlans();
                    handleCloseModal();
                }
            }
        } catch (error: any) {
            console.error('Plan action error:', error);
            toast.error(error.response?.data?.message || 'Action failed', { id: loadingToast });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this plan?')) return;

        const loadingToast = toast.loading('Removing plan...');
        try {
            const response = await api.delete(`/api/v1/admins/plans/${id}`);
            if (response.data.success) {
                toast.success('Plan deleted successfully', { id: loadingToast });
                fetchPlans();
            }
        } catch (error: any) {
            console.error('Delete plan error:', error);
            toast.error(error.response?.data?.message || 'Delete failed', { id: loadingToast });
        }
    };

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <div className="header-info">
                    <h2>Subscription Plans</h2>
                    <p>Configure pricing and credit allotments</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()} disabled={isLoading}>
                    <Plus size={18} />
                    Create Plan
                </button>
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
                    <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
                    <p>Loading plans...</p>
                </div>
            ) : (
                <div className="plans-grid">
                    {plans.length > 0 ? (
                        plans.map((plan) => (
                            <div key={plan._id} className={`plan-card card ${plan.mostPopular ? 'popular' : ''}`}>
                                {plan.mostPopular && <div className="badge popular-badge">Most Popular</div>}
                                {plan.bestValue && <div className="badge value-badge">Best Value</div>}

                                <div className="plan-title">
                                    <h3>{plan.name}</h3>
                                    <div className="price">
                                        <span className="currency">₹</span>
                                        <span className="amount">{plan.amount}</span>
                                    </div>
                                </div>

                                <div className="plan-details">
                                    <div className="detail-item">
                                        <span className="label">Credits:</span>
                                        <span className="value">{plan.credits}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">ID:</span>
                                        <span className="value text-muted">{plan.playStorePlanId}</span>
                                    </div>
                                </div>

                                <ul className="bullet-points">
                                    {plan.bulletPoints.map((point, i) => (
                                        <li key={i}>
                                            <Check size={14} className="text-success" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>

                                <div className="plan-actions">
                                    <button className="btn btn-secondary" onClick={() => handleOpenModal(plan)}>
                                        <Edit2 size={16} /> Edit
                                    </button>
                                    <button className="btn btn-secondary btn-icon-danger" onClick={() => handleDelete(plan._id)}>
                                        <Trash2 size={16} /> Remove
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
                            No subscription plans found.
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingPlan ? 'Edit Plan' : 'Add New Plan'}
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={handleCloseModal} disabled={isActionLoading}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={isActionLoading}>
                            {isActionLoading && <Loader2 size={16} className="animate-spin" />}
                            {editingPlan ? 'Save Changes' : 'Create Plan'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">Plan Name</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled={isActionLoading}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Price (₹)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                                required
                                disabled={isActionLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Credits</label>
                            <input
                                type="number"
                                className="input-field"
                                value={formData.credits}
                                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                                required
                                disabled={isActionLoading}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Play Store Plan ID</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.playStorePlanId}
                            onChange={(e) => setFormData({ ...formData, playStorePlanId: e.target.value })}
                            required
                            disabled={isActionLoading}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0.5rem 0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                            <input
                                type="checkbox"
                                checked={formData.mostPopular}
                                onChange={(e) => setFormData({ ...formData, mostPopular: e.target.checked })}
                                disabled={isActionLoading}
                                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                            />
                            Most Popular
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                            <input
                                type="checkbox"
                                checked={formData.bestValue}
                                onChange={(e) => setFormData({ ...formData, bestValue: e.target.checked })}
                                disabled={isActionLoading}
                                style={{ width: '18px', height: '18px', accentColor: 'var(--status-success)' }}
                            />
                            Best Value
                        </label>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Bullet Points (comma separated)</label>
                        <textarea
                            className="input-field"
                            style={{ minHeight: '80px', resize: 'vertical' }}
                            value={formData.bulletPoints}
                            onChange={(e) => setFormData({ ...formData, bulletPoints: e.target.value })}
                            placeholder="10 Credits, HD Exports, ..."
                            disabled={isActionLoading}
                        />
                    </div>
                </form>
            </Modal>

            <style>{`
        .form-label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--text-secondary); }
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--spacing-xl);
          margin-top: var(--spacing-lg);
        }

        .plan-card {
          position: relative;
          display: flex;
          flex-direction: column;
          padding-top: 3rem;
        }

        .plan-card.popular {
          border-color: var(--accent-primary);
          box-shadow: 0 0 20px var(--accent-glow);
        }

        .badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .popular-badge {
          background: var(--accent-primary);
          color: white;
        }

        .value-badge {
          background: var(--status-success);
          color: white;
          right: auto;
          left: 1rem;
        }

        .plan-title {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .plan-title h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
        }

        .price .currency {
          font-size: 1.5rem;
          font-weight: 600;
          vertical-align: top;
          margin-right: 2px;
        }

        .price .amount {
          font-size: 3rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .plan-details {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-xl);
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .detail-item .label {
          color: var(--text-muted);
        }

        .bullet-points {
          list-style: none;
          margin-bottom: var(--spacing-xl);
          flex: 1;
        }

        .bullet-points li {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: 0.9375rem;
          margin-bottom: 0.75rem;
          color: var(--text-secondary);
        }

        .text-success { color: var(--status-success); }

        .plan-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-md);
        }

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

export default Plans;
