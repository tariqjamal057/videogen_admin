import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Play, CreditCard, Loader2 } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon }) => {
  const trend = change >= 0 ? 'up' : 'down';
  const absChange = Math.abs(change).toFixed(1);

  return (
    <div className="card stat-card">
      <div className="stat-icon">
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
        <p className={`stat-trend ${trend}`}>
          <TrendingUp size={14} style={{ transform: trend === 'down' ? 'rotate(180deg)' : 'none' }} />
          {trend === 'up' ? '+' : '-'}{absChange}% <span>vs last month</span>
        </p>
      </div>
    </div>
  );
};

interface DashboardData {
  totalUsers: number;
  totalVideos: number;
  totalRevenue: number;
  totalValueChangeInRevenue: number;
  totalValueChangeInUsers: number;
  totalValueChangeInVideos: number;
  recentGenerations?: any[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    totalUsers: 0,
    totalVideos: 0,
    totalRevenue: 0,
    totalValueChangeInRevenue: 0,
    totalValueChangeInUsers: 0,
    totalValueChangeInVideos: 0,
    recentGenerations: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 1: return { label: 'Pending', class: 'status-pending' };
      case 2: return { label: 'Generated', class: 'status-active' };
      case 3: return { label: 'Failed', class: 'status-inactive' };
      default: return { label: 'Pending', class: 'status-pending' };
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/v1/admins/auth/dashboard');
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error: any) {
      console.error('Fetch dashboard error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
        <p>Loading analytics...</p>
        <style>{`
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="page-header">
        <div className="header-info">
          <h2>Analytics Overview</h2>
          <p>Key metrics and recent system activity</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={data.totalUsers.toLocaleString()}
          change={data.totalValueChangeInUsers}
          icon={Users}
        />
        <StatCard
          title="Videos Generated"
          value={data.totalVideos.toLocaleString()}
          change={data.totalValueChangeInVideos}
          icon={Play}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${data.totalRevenue.toLocaleString()}`}
          change={data.totalValueChangeInRevenue}
          icon={CreditCard}
        />
      </div>

      <div className="dashboard-grid">
        <div className="card recent-activity glass">
          <div className="card-header">
            <h3>Recent Generation Tasks</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => window.location.href = '/videos'}>View All</button>
          </div>
          <div className="activity-list">
            {data.recentGenerations && data.recentGenerations.length > 0 ? (
              data.recentGenerations.map((video: any) => (
                <div key={video._id} className="activity-item">
                  <div className="activity-icon">
                    <Play size={16} />
                  </div>
                  <div className="activity-info">
                    <p><strong>{video.prompt || video.templateId?.name || 'Untitled Video'}</strong></p>
                    <p className="text-muted">User: {video.userId?.email || 'Unknown User'} • {new Date(video.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`status-badge ${getStatusInfo(video.status).class}`}>
                    {getStatusInfo(video.status).label}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No recent activity found.</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        .stat-card {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-lg);
          padding: var(--spacing-xl);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
          border: 1px solid var(--border-color);
        }

        .stat-title {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .stat-trend.up { color: var(--status-success); }
        .stat-trend.down { color: var(--status-error); }
        .stat-trend span { color: var(--text-muted); font-weight: 400; margin-left: 2px; }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--spacing-lg);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xl);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-sm) 0;
          border-bottom: 1px solid var(--border-color);
        }

        .activity-icon {
          width: 32px;
          height: 32px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
        }

        .activity-info p { font-size: 0.875rem; }

        .plans-chart {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xl);
        }

        .plan-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .chart-bar-bg {
          height: 8px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .chart-bar {
          height: 100%;
          background: var(--accent-primary);
        }

        @media (max-width: 1024px) {
          .dashboard-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
