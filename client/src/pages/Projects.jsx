import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/services';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import {
  HiOutlinePlusCircle,
  HiOutlineSearch,
  HiOutlineDotsVertical,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineUserGroup,
  HiOutlineClipboardList
} from 'react-icons/hi';

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#14b8a6',
];

const statusLabels = {
  planning: { label: 'Planning', class: 'badge-info' },
  active: { label: 'Active', class: 'badge-success' },
  completed: { label: 'Completed', class: 'badge-primary' },
  'on-hold': { label: 'On Hold', class: 'badge-warning' },
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    name: '', description: '', status: 'planning', priority: 'medium',
    color: '#6366f1', startDate: '', endDate: ''
  });

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, search]);

  const fetchProjects = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await projectService.getAll(params);
      setProjects(data);
    } catch (error) {
      console.error('Fetch projects error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    try {
      if (editProject) {
        const { data } = await projectService.update(editProject._id, form);
        setProjects(prev => prev.map(p => p._id === editProject._id ? data : p));
        toast.success('Project updated!');
      } else {
        const { data } = await projectService.create(form);
        setProjects(prev => [data, ...prev]);
        toast.success('Project created!');
      }
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? All tasks will be deleted.')) return;
    try {
      await projectService.delete(id);
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const openEdit = (project) => {
    setEditProject(project);
    setForm({
      name: project.name,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      color: project.color,
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
    });
    setShowCreate(true);
    setDropdownOpen(null);
  };

  const closeModal = () => {
    setShowCreate(false);
    setEditProject(null);
    setForm({ name: '', description: '', status: 'planning', priority: 'medium', color: '#6366f1', startDate: '', endDate: '' });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg"></div>
        <p className="loading-text">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage and track all your projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)} id="create-project-btn">
          <HiOutlinePlusCircle /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="header-search" style={{ position: 'relative' }}>
          <HiOutlineSearch className="header-search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px' }}
            id="project-search"
          />
        </div>
        <select
          className="form-input form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          id="project-status-filter"
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
        </select>
      </div>

      {/* Project Grid */}
      {projects.length > 0 ? (
        <div className="project-grid">
          {projects.map((project) => (
            <div
              key={project._id}
              className="project-card"
              style={{ '--project-color': project.color }}
              onClick={() => navigate(`/projects/${project._id}`)}
            >
              <div className="project-card-header">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${statusLabels[project.status]?.class}`}>
                      {statusLabels[project.status]?.label}
                    </span>
                  </div>
                  <h3 className="project-card-name">{project.name}</h3>
                </div>
                <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(dropdownOpen === project._id ? null : project._id);
                    }}
                  >
                    <HiOutlineDotsVertical />
                  </button>
                  {dropdownOpen === project._id && (
                    <div className="dropdown-menu">
                      <button className="dropdown-item" onClick={() => openEdit(project)}>
                        <HiOutlinePencil /> Edit
                      </button>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item danger" onClick={() => { handleDelete(project._id); setDropdownOpen(null); }}>
                        <HiOutlineTrash /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="project-card-desc">{project.description || 'No description'}</p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-secondary">Progress</span>
                  <span className="text-xs font-semibold">{project.completionPercentage}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${project.completionPercentage}%` }}></div>
                </div>
              </div>

              <div className="project-card-footer">
                <div className="project-card-stats">
                  <span className="project-card-stat">
                    <HiOutlineClipboardList /> {project.totalTasks} tasks
                  </span>
                  <span className="project-card-stat">
                    <HiOutlineUserGroup /> {project.members?.length || 0}
                  </span>
                </div>
                {project.members?.length > 0 && (
                  <div className="avatar-group">
                    {project.members.slice(0, 3).map((member, idx) => (
                      <div key={idx} className="avatar avatar-sm" title={member.user?.name}>
                        {member.user?.name?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {project.members.length > 3 && (
                      <div className="avatar avatar-sm" style={{ background: 'var(--gray-400)' }}>
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <div className="empty-state-title">No projects yet</div>
          <div className="empty-state-desc">Create your first project to get started managing tasks</div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <HiOutlinePlusCircle /> Create Project
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showCreate} onClose={closeModal} title={editProject ? 'Edit Project' : 'Create New Project'}>
        <form onSubmit={handleCreate}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter project name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                id="project-name-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Describe your project..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                id="project-desc-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-input form-select"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-input form-select"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <div className="color-picker">
                {PROJECT_COLORS.map((color) => (
                  <div
                    key={color}
                    className={`color-option ${form.color === color ? 'selected' : ''}`}
                    style={{ background: color }}
                    onClick={() => setForm({ ...form, color })}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="save-project-btn">
              {editProject ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
