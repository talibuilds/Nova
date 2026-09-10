import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService, taskService, activityService, authService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import {
  HiOutlineArrowLeft,
  HiOutlinePlusCircle,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineUserAdd,
  HiOutlineCalendar,
  HiOutlineFlag,
  HiOutlineCheckCircle,
  HiOutlineChat,
  HiOutlineX
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

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comment, setComment] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');

  const [taskForm, setTaskForm] = useState({
    title: '', description: '', status: 'todo', priority: 'medium', assignee: '', dueDate: '', labels: ''
  });

  useEffect(() => {
    fetchProject();
    fetchActivities();
    fetchUsers();
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data } = await projectService.getById(id);
      setProject(data);
      setTasks(data.tasks || []);
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data } = await activityService.getByProject(id, { limit: 15 });
      setActivities(data);
    } catch (error) {
      console.error('Fetch activities error:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await authService.getUsers();
      setAllUsers(data);
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    try {
      const payload = {
        ...taskForm,
        project: id,
        assignee: taskForm.assignee || undefined,
        labels: taskForm.labels ? taskForm.labels.split(',').map(l => l.trim()) : [],
      };
      if (editingTask) {
        const { data } = await taskService.update(editingTask._id, payload);
        setTasks(prev => prev.map(t => t._id === editingTask._id ? data : t));
        toast.success('Task updated!');
      } else {
        const { data } = await taskService.create(payload);
        setTasks(prev => [...prev, data]);
        toast.success('Task created!');
      }
      closeTaskModal();
      fetchActivities();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      setSelectedTask(null);
      toast.success('Task deleted');
      fetchActivities();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await taskService.update(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? data : t));
      if (selectedTask?._id === taskId) setSelectedTask(data);
      fetchActivities();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const { data } = await taskService.addComment(selectedTask._id, { text: comment });
      setSelectedTask(data);
      setTasks(prev => prev.map(t => t._id === data._id ? data : t));
      setComment('');
      fetchActivities();
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleAddMember = async (userId) => {
    try {
      const { data } = await projectService.addMember(id, { userId });
      setProject(data);
      toast.success('Member added!');
      setShowMemberModal(false);
      fetchActivities();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const { data } = await projectService.removeMember(id, userId);
      setProject(data);
      toast.success('Member removed');
      fetchActivities();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignee: task.assignee?._id || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      labels: task.labels?.join(', ') || '',
    });
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
    setTaskForm({ title: '', description: '', status: 'todo', priority: 'medium', assignee: '', dueDate: '', labels: '' });
  };

  const filteredTasks = tasks.filter(t => taskFilter === 'all' || t.status === taskFilter);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg"></div>
        <p className="loading-text">Loading project...</p>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="fade-in">
      {/* Back button */}
      <button className="btn btn-ghost mb-4" onClick={() => navigate('/projects')}>
        <HiOutlineArrowLeft /> Back to Projects
      </button>

      {/* Project Header */}
      <div className="project-detail-header" style={{ '--project-color': project.color }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div style={{ flex: 1 }}>
            <h1 className="project-detail-title">{project.name}</h1>
            <p className="project-detail-desc">{project.description || 'No description'}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)}>
              <HiOutlineUserAdd /> Add Member
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>
              <HiOutlinePlusCircle /> Add Task
            </button>
          </div>
        </div>

        <div className="project-detail-meta mt-4">
          <div className="project-meta-item">
            <HiOutlineFlag /> Priority: <strong style={{ textTransform: 'capitalize' }}>{project.priority}</strong>
          </div>
          <div className="project-meta-item">
            <HiOutlineCalendar /> Created: <strong>{format(new Date(project.createdAt), 'MMM dd, yyyy')}</strong>
          </div>
          <div className="project-meta-item">
            <HiOutlineCheckCircle /> Progress: <strong>{project.completionPercentage}%</strong>
          </div>
          <div className="project-meta-item">
            Tasks: <strong>{project.completedTasks}/{project.totalTasks}</strong>
          </div>
        </div>

        <div className="mt-4">
          <div className="progress-bar" style={{ height: '10px' }}>
            <div className="progress-bar-fill" style={{ width: `${project.completionPercentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="members-section">
        <h3 className="font-bold mb-4" style={{ fontSize: 'var(--font-md)' }}>Team Members ({project.members?.length || 0})</h3>
        <div className="members-grid">
          {project.members?.map((member, idx) => (
            <div key={idx} className="member-card">
              <div className="avatar avatar-sm">
                {member.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="member-card-name">{member.user?.name}</div>
                <div className="member-card-role">{member.role}</div>
              </div>
              {member.user?._id !== project.owner?._id && member.user?._id !== user?._id && (
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => handleRemoveMember(member.user?._id)}
                  style={{ marginLeft: 'auto' }}
                >
                  <HiOutlineX style={{ fontSize: '0.75rem' }} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
          Tasks ({tasks.length})
        </button>
        <button className={`tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
          Activity
        </button>
      </div>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div>
          <div className="filter-bar">
            {['all', 'todo', 'in-progress', 'in-review', 'done'].map((status) => (
              <button
                key={status}
                className={`btn btn-sm ${taskFilter === status ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTaskFilter(status)}
              >
                {status === 'all' ? 'All' : statusStyles[status]?.label}
              </button>
            ))}
          </div>

          {filteredTasks.length > 0 ? (
            <div className="task-list">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className="task-list-item"
                  onClick={() => setSelectedTask(task)}
                >
                  <div
                    className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(task._id, task.status === 'done' ? 'todo' : 'done');
                    }}
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
                  <div className="flex items-center gap-2">
                    {task.assignee && (
                      <div className="avatar avatar-sm" title={task.assignee.name}>
                        {task.assignee.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={(e) => { e.stopPropagation(); openEditTask(task); }}
                    >
                      <HiOutlinePencil />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}
                      style={{ color: 'var(--error)' }}
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No tasks yet</div>
              <div className="empty-state-desc">Add your first task to this project</div>
              <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
                <HiOutlinePlusCircle /> Add Task
              </button>
            </div>
          )}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="card">
          {activities.length > 0 ? (
            <div className="activity-feed">
              {activities.map((activity) => (
                <div key={activity._id} className="activity-item">
                  <div className="avatar avatar-sm">
                    {activity.user?.name?.charAt(0).toUpperCase()}
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
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-title">No activity yet</div>
            </div>
          )}
        </div>
      )}

      {/* Task Detail Side Panel */}
      {selectedTask && (
        <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Task Details" size="lg">
          <div className="modal-body">
            <h3 className="font-bold" style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-2)' }}>{selectedTask.title}</h3>
            <p className="text-secondary mb-4">{selectedTask.description || 'No description'}</p>
            
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className={`badge ${priorityStyles[selectedTask.priority]?.class}`}>{priorityStyles[selectedTask.priority]?.label}</span>
              <span className={`badge ${statusStyles[selectedTask.status]?.class}`}>{statusStyles[selectedTask.status]?.label}</span>
              {selectedTask.dueDate && (
                <span className="badge badge-neutral">
                  <HiOutlineCalendar /> {format(new Date(selectedTask.dueDate), 'MMM dd, yyyy')}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-input form-select"
                value={selectedTask.status}
                onChange={(e) => handleStatusChange(selectedTask._id, e.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Comments */}
            <h4 className="font-bold mt-6 mb-4">Comments ({selectedTask.comments?.length || 0})</h4>
            {selectedTask.comments?.length > 0 && (
              <div className="comment-list">
                {selectedTask.comments.map((c, idx) => (
                  <div key={idx} className="comment-item">
                    <div className="avatar avatar-sm">{c.user?.name?.charAt(0).toUpperCase()}</div>
                    <div className="comment-body">
                      <div className="comment-author">{c.user?.name}</div>
                      <div className="comment-text">{c.text}</div>
                      <div className="comment-time">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form className="comment-form" onSubmit={handleAddComment}>
              <input
                type="text"
                className="form-input"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">Send</button>
            </form>
          </div>
        </Modal>
      )}

      {/* Create/Edit Task Modal */}
      <Modal isOpen={showTaskModal} onClose={closeTaskModal} title={editingTask ? 'Edit Task' : 'Create Task'}>
        <form onSubmit={handleCreateTask}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Task title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Describe the task..."
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input form-select" value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="in-review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-input form-select" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select className="form-input form-select" value={taskForm.assignee} onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}>
                  <option value="">Unassigned</option>
                  {project.members?.map((member) => (
                    <option key={member.user?._id} value={member.user?._id}>{member.user?.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Labels (comma separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="bug, feature, urgent"
                value={taskForm.labels}
                onChange={(e) => setTaskForm({ ...taskForm, labels: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeTaskModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingTask ? 'Update' : 'Create'} Task</button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Team Member">
        <div className="modal-body">
          <p className="text-secondary mb-4">Select a user to add to this project:</p>
          <div className="task-list">
            {allUsers
              .filter(u => !project.members?.some(m => m.user?._id === u._id))
              .map((u) => (
                <div key={u._id} className="task-list-item" onClick={() => handleAddMember(u._id)}>
                  <div className="avatar avatar-sm">{u.name?.charAt(0).toUpperCase()}</div>
                  <div className="task-list-info">
                    <div className="task-list-title">{u.name}</div>
                    <div className="text-xs text-tertiary">{u.email}</div>
                  </div>
                  <button className="btn btn-primary btn-sm">Add</button>
                </div>
              ))}
            {allUsers.filter(u => !project.members?.some(m => m.user?._id === u._id)).length === 0 && (
              <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
                <div className="empty-state-desc">No more users to add</div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
