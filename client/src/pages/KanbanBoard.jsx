import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { projectService, taskService } from '../services/services';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  HiOutlinePlusCircle,
  HiOutlineCalendar,
  HiOutlineChat,
  HiOutlineFlag
} from 'react-icons/hi';

const columns = [
  { id: 'todo', title: 'To Do', dotColor: '#94a3b8' },
  { id: 'in-progress', title: 'In Progress', dotColor: '#3b82f6' },
  { id: 'in-review', title: 'In Review', dotColor: '#f59e0b' },
  { id: 'done', title: 'Done', dotColor: '#10b981' },
];

const priorityColors = {
  low: '#10b981',
  medium: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
};

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [addTaskColumn, setAddTaskColumn] = useState('todo');
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'medium', assignee: '', dueDate: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const { data } = await projectService.getAll();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0]._id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Fetch projects error:', error);
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await taskService.getAll({ project: selectedProject });
      setTasks(data);
    } catch (error) {
      console.error('Fetch tasks error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColumnTasks = (columnId) => {
    return tasks.filter(t => t.status === columnId).sort((a, b) => a.order - b.order);
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic update
    const taskId = draggableId;
    const newStatus = destination.droppableId;
    const newIndex = destination.index;

    // Update local state
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t._id === taskId) {
          return { ...t, status: newStatus, order: newIndex };
        }
        return t;
      });
      return updated;
    });

    // Update on server
    try {
      await taskService.updateOrder(taskId, { status: newStatus, order: newIndex });
    } catch (error) {
      console.error('Update order error:', error);
      fetchTasks(); // Revert on error
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    try {
      const { data } = await taskService.create({
        ...taskForm,
        project: selectedProject,
        status: addTaskColumn,
        assignee: taskForm.assignee || undefined,
      });
      setTasks(prev => [...prev, data]);
      toast.success('Task created!');
      setShowAddTask(false);
      setTaskForm({ title: '', description: '', priority: 'medium', assignee: '', dueDate: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const currentProject = projects.find(p => p._id === selectedProject);

  if (loading && projects.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg"></div>
        <p className="loading-text">Loading board...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Kanban Board</h1>
          <p className="page-subtitle">Drag and drop tasks to update their status</p>
        </div>
        <select
          className="form-input form-select"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          style={{ width: '240px' }}
          id="kanban-project-select"
        >
          {projects.map((project) => (
            <option key={project._id} value={project._id}>{project.name}</option>
          ))}
        </select>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No projects yet</div>
          <div className="empty-state-desc">Create a project first to use the Kanban board</div>
        </div>
      ) : loading ? (
        <div className="loading-container">
          <div className="spinner spinner-lg"></div>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-board">
            {columns.map((column) => {
              const columnTasks = getColumnTasks(column.id);
              return (
                <div key={column.id} className="kanban-column">
                  <div className="kanban-column-header">
                    <div className="kanban-column-title">
                      <div className="color-dot" style={{ background: column.dotColor }}></div>
                      {column.title}
                    </div>
                    <div className="kanban-column-count">{columnTasks.length}</div>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        className="kanban-column-body"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          background: snapshot.isDraggingOver ? 'rgba(99, 102, 241, 0.05)' : undefined,
                          borderRadius: 'var(--radius-lg)',
                          transition: 'background 0.2s ease',
                        }}
                      >
                        {columnTasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                className={`kanban-task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                {task.labels?.length > 0 && (
                                  <div className="kanban-task-labels">
                                    {task.labels.slice(0, 3).map((label, i) => (
                                      <span key={i} className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                                        {label}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <div className="kanban-task-title">{task.title}</div>
                                {task.description && (
                                  <p className="text-xs text-secondary" style={{ marginBottom: 'var(--space-2)', lineHeight: 1.4 }}>
                                    {task.description.substring(0, 80)}{task.description.length > 80 ? '...' : ''}
                                  </p>
                                )}
                                <div className="kanban-task-meta">
                                  <div className="flex items-center gap-2">
                                    <span style={{
                                      width: '8px', height: '8px', borderRadius: '50%',
                                      background: priorityColors[task.priority],
                                      display: 'inline-block'
                                    }}></span>
                                    {task.dueDate && (
                                      <span className="text-xs text-tertiary flex items-center gap-1">
                                        <HiOutlineCalendar /> {format(new Date(task.dueDate), 'MMM dd')}
                                      </span>
                                    )}
                                    {task.comments?.length > 0 && (
                                      <span className="text-xs text-tertiary flex items-center gap-1">
                                        <HiOutlineChat /> {task.comments.length}
                                      </span>
                                    )}
                                  </div>
                                  {task.assignee && (
                                    <div className="avatar avatar-sm" title={task.assignee.name} style={{ width: '24px', height: '24px', fontSize: '0.65rem' }}>
                                      {task.assignee.name?.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <button
                    className="kanban-add-task"
                    onClick={() => { setAddTaskColumn(column.id); setShowAddTask(true); }}
                  >
                    <HiOutlinePlusCircle /> Add Task
                  </button>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Add Task Modal */}
      <Modal isOpen={showAddTask} onClose={() => setShowAddTask(false)} title="Add Task">
        <form onSubmit={handleAddTask}>
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
                <label className="form-label">Priority</label>
                <select className="form-input form-select" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select className="form-input form-select" value={taskForm.assignee} onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}>
                <option value="">Unassigned</option>
                {currentProject?.members?.map((member) => (
                  <option key={member.user?._id} value={member.user?._id}>{member.user?.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddTask(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Task</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default KanbanBoard;
