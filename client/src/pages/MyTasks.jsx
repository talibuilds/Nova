import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../services/services';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  HiOutlineCalendar,
  HiOutlineChat,
  HiOutlineCheckCircle,
  HiOutlineFilter,
  HiOutlineSearch
} from 'react-icons/hi';

const priorityStyles = {
  low: { class: 'badge-success', label: 'Low' },
  medium: { class: 'badge-info', label: 'Medium' },
  high: { class: 'badge-warning', label: 'High' },
  urgent: { class: 'badge-danger', label: 'Urgent' },
};

const statusStyles = {
  todo: { class: 'badge-neutral', label: 'To Do' },
  'in-progress': { class: 'badge-info', label: 'In Progress' },
  'in-review': { class: 'badge-warning', label: 'In Review' },
  done: { class: 'badge-success', label: 'Done' },
};

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, search]);

  const fetchTasks = async () => {
    try {
      const params = { assignee: 'me' };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (search) params.search = search;
      const { data } = await taskService.getAll(params);
      setTasks(data);
    } catch (error) {
      console.error('Fetch tasks error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await taskService.update(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? data : t));
      toast.success(`Task marked as ${statusStyles[newStatus]?.label}`);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  // Group tasks by project
  const groupedTasks = tasks.reduce((groups, task) => {
    const projectName = task.project?.name || 'Unknown Project';
    if (!groups[projectName]) {
      groups[projectName] = { color: task.project?.color || '#6366f1', tasks: [] };
    }
    groups[projectName].tasks.push(task);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg"></div>
        <p className="loading-text">Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">{tasks.length} tasks assigned to you</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div style={{ position: 'relative' }}>
          <HiOutlineSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', minWidth: '200px' }}
          />
        </div>
        <select
          className="form-input form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ minWidth: '140px' }}
        >
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="in-review">In Review</option>
          <option value="done">Done</option>
        </select>
        <select
          className="form-input form-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{ minWidth: '140px' }}
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Task Stats */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card" style={{ '--stat-color': '#94a3b8' }}>
          <div className="stat-icon" style={{ background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }}>📋</div>
          <div className="stat-info">
            <div className="stat-value">{tasks.filter(t => t.status === 'todo').length}</div>
            <div className="stat-label">To Do</div>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#3b82f6' }}>
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>🔄</div>
          <div className="stat-info">
            <div className="stat-value">{tasks.filter(t => t.status === 'in-progress').length}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#f59e0b' }}>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>👀</div>
          <div className="stat-info">
            <div className="stat-value">{tasks.filter(t => t.status === 'in-review').length}</div>
            <div className="stat-label">In Review</div>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#10b981' }}>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>✅</div>
          <div className="stat-info">
            <div className="stat-value">{tasks.filter(t => t.status === 'done').length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      {/* Tasks grouped by project */}
      {Object.keys(groupedTasks).length > 0 ? (
        Object.entries(groupedTasks).map(([projectName, group]) => (
          <div key={projectName} className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="color-dot" style={{ background: group.color }}></div>
              <h3 className="font-bold">{projectName}</h3>
              <span className="badge badge-neutral">{group.tasks.length}</span>
            </div>
            <div className="task-list">
              {group.tasks.map((task) => (
                <div key={task._id} className="task-list-item">
                  <div
                    className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`}
                    onClick={() => handleStatusChange(task._id, task.status === 'done' ? 'todo' : 'done')}
                  >
                    {task.status === 'done' && '✓'}
                  </div>
                  <div className="task-list-info">
                    <div className={`task-list-title ${task.status === 'done' ? 'done' : ''}`}>{task.title}</div>
                    <div className="task-list-meta">
                      <span className={`badge ${priorityStyles[task.priority]?.class}`}>
                        {priorityStyles[task.priority]?.label}
                      </span>
                      <span className={`badge ${statusStyles[task.status]?.class}`}>
                        {statusStyles[task.status]?.label}
                      </span>
                      {task.dueDate && (
                        <span className={`due-date ${new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'overdue' : 'on-track'}`}>
                          <HiOutlineCalendar /> {format(new Date(task.dueDate), 'MMM dd')}
                        </span>
                      )}
                      {task.comments?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <HiOutlineChat /> {task.comments.length}
                        </span>
                      )}
                    </div>
                  </div>
                  <select
                    className="form-input form-select"
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    style={{ width: '140px', padding: '4px 28px 4px 8px', fontSize: 'var(--font-xs)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="in-review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No tasks assigned to you</div>
          <div className="empty-state-desc">Tasks assigned to you will appear here</div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
