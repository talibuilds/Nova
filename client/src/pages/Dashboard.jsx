import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService, activityService } from '../services/services';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { format, formatDistanceToNow } from 'date-fns';
import {
  HiOutlineFolder,
  HiOutlineClipboardCheck,
  HiOutlineTrendingUp,
  HiOutlineExclamationCircle,
  HiOutlineLightningBolt,
  HiOutlinePlusCircle,
  HiOutlineArrowRight
} from 'react-icons/hi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, chartsRes, activitiesRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getCharts(),
        activityService.getAll({ limit: 8 })
      ]);
      setStats(statsRes.data);
      setCharts(chartsRes.data);
      setActivities(activitiesRes.data.activities || []);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getActivityIcon = (action) => {
    const icons = {
      project_created: { icon: '📁', bg: 'var(--primary-100)', color: 'var(--primary-600)' },
      task_created: { icon: '✅', bg: 'var(--success-light)', color: 'var(--success)' },
      task_status_changed: { icon: '🔄', bg: 'var(--info-light)', color: 'var(--info)' },
      task_assigned: { icon: '👤', bg: 'var(--warning-light)', color: 'var(--warning)' },
      comment_added: { icon: '💬', bg: 'var(--accent-cyan)', color: 'white' },
      member_added: { icon: '👥', bg: 'var(--primary-100)', color: 'var(--primary-600)' },
      project_updated: { icon: '✏️', bg: 'var(--warning-light)', color: 'var(--warning)' },
      task_updated: { icon: '📝', bg: 'var(--info-light)', color: 'var(--info)' },
      task_deleted: { icon: '🗑️', bg: 'var(--error-light)', color: 'var(--error)' },
    };
    return icons[action] || { icon: '📌', bg: 'var(--gray-100)', color: 'var(--gray-500)' };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  const statusChartData = charts ? {
    labels: ['To Do', 'In Progress', 'In Review', 'Done'],
    datasets: [{
      data: [charts.tasksByStatus.todo, charts.tasksByStatus['in-progress'], charts.tasksByStatus['in-review'], charts.tasksByStatus.done],
      backgroundColor: ['#94a3b8', '#3b82f6', '#f59e0b', '#10b981'],
      borderWidth: 0,
      borderRadius: 6,
    }]
  } : null;

  const priorityChartData = charts ? {
    labels: ['Low', 'Medium', 'High', 'Urgent'],
    datasets: [{
      data: [charts.tasksByPriority.low, charts.tasksByPriority.medium, charts.tasksByPriority.high, charts.tasksByPriority.urgent],
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
      borderWidth: 0,
    }]
  } : null;

  const weeklyChartData = charts ? {
    labels: charts.weeklyProgress.map(d => d.day),
    datasets: [
      {
        label: 'Created',
        data: charts.weeklyProgress.map(d => d.created),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderWidth: 0,
        pointRadius: 4,
      },
      {
        label: 'Completed',
        data: charts.weeklyProgress.map(d => d.completed),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderWidth: 0,
        pointRadius: 4,
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { stepSize: 1, font: { family: 'Inter', size: 11 } }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { family: 'Inter', size: 12 }, padding: 16, usePointStyle: true, pointStyle: 'circle' }
      }
    }
  };

  const lineOptions = {
    ...chartOptions,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { font: { family: 'Inter', size: 12 }, padding: 16, usePointStyle: true, pointStyle: 'circle' }
      }
    }
  };

  return (
    <div className="fade-in">
      {/* Greeting */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your projects</p>
        </div>
        <Link to="/projects" className="btn btn-primary" id="new-project-link">
          <HiOutlinePlusCircle /> New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-color': '#6366f1' }}>
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
            <HiOutlineFolder />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalProjects || 0}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#10b981' }}>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <HiOutlineClipboardCheck />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats?.completedTasks || 0}<span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>/{stats?.totalTasks || 0}</span></div>
            <div className="stat-label">Tasks Completed</div>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#8b5cf6' }}>
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <HiOutlineTrendingUp />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats?.completionRate || 0}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#ef4444' }}>
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <HiOutlineExclamationCircle />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats?.overdueTasks || 0}</div>
            <div className="stat-label">Overdue Tasks</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-title">Weekly Progress</div>
          <div style={{ height: '250px' }}>
            {weeklyChartData && <Line data={weeklyChartData} options={lineOptions} />}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Tasks by Status</div>
          <div style={{ height: '250px' }}>
            {statusChartData && <Doughnut data={statusChartData} options={doughnutOptions} />}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Tasks by Priority</div>
          <div style={{ height: '250px' }}>
            {priorityChartData && <Bar data={priorityChartData} options={chartOptions} />}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold" style={{ fontSize: 'var(--font-lg)' }}>Recent Activity</h3>
        </div>
        {activities.length > 0 ? (
          <div className="activity-feed">
            {activities.map((activity) => {
              const actIcon = getActivityIcon(activity.action);
              return (
                <div key={activity._id} className="activity-item">
                  <div className="activity-icon" style={{ background: actIcon.bg, fontSize: '1rem' }}>
                    {actIcon.icon}
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">
                      <strong>{activity.user?.name}</strong> {activity.details}
                    </div>
                    <div className="activity-time">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-title">No activity yet</div>
            <div className="empty-state-desc">Create your first project to get started!</div>
            <Link to="/projects" className="btn btn-primary">
              <HiOutlinePlusCircle /> Create Project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
