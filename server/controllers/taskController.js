const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

// @desc    Get tasks (with filters)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { project, status, priority, assignee, search, sort } = req.query;
    
    let query = {};

    // If project filter, check access
    if (project) {
      query.project = project;
    } else {
      // Get all projects user has access to
      const userProjects = await Project.find({
        $or: [
          { owner: req.user._id },
          { 'members.user': req.user._id }
        ]
      }).select('_id');
      
      query.project = { $in: userProjects.map(p => p._id) };
    }

    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (assignee === 'me') query.assignee = req.user._id;
    if (assignee === 'unassigned') query.assignee = null;

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    let sortOption = { order: 1, createdAt: -1 };
    if (sort === 'priority') sortOption = { priority: -1, createdAt: -1 };
    if (sort === 'dueDate') sortOption = { dueDate: 1 };
    if (sort === 'created') sortOption = { createdAt: -1 };

    const tasks = await Task.find(query)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color')
      .populate('comments.user', 'name email avatar')
      .sort(sortOption);

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color')
      .populate('comments.user', 'name email avatar');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, project, assignee, status, priority, dueDate, labels } = req.body;

    // Verify project exists and user has access
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get max order for the status column
    const maxOrderTask = await Task.findOne({ project, status: status || 'todo' })
      .sort({ order: -1 });
    const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      project,
      assignee: assignee || null,
      reporter: req.user._id,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      labels,
      order
    });

    await task.populate('assignee', 'name email avatar');
    await task.populate('reporter', 'name email avatar');
    await task.populate('project', 'name color');

    // Log activity
    await Activity.create({
      user: req.user._id,
      project,
      task: task._id,
      action: 'task_created',
      details: `Created task "${task.title}"`
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const oldStatus = task.status;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color')
      .populate('comments.user', 'name email avatar');

    // Determine action type
    let action = 'task_updated';
    let details = `Updated task "${updatedTask.title}"`;

    if (req.body.status && req.body.status !== oldStatus) {
      action = 'task_status_changed';
      details = `Changed status of "${updatedTask.title}" from ${oldStatus} to ${req.body.status}`;
    }

    if (req.body.assignee && req.body.assignee !== task.assignee?.toString()) {
      action = 'task_assigned';
      details = `Assigned "${updatedTask.title}"`;
    }

    // Log activity
    await Activity.create({
      user: req.user._id,
      project: task.project,
      task: task._id,
      action,
      details
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Log activity before deletion
    await Activity.create({
      user: req.user._id,
      project: task.project,
      action: 'task_deleted',
      details: `Deleted task "${task.title}"`
    });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.comments.push({
      user: req.user._id,
      text: req.body.text
    });

    await task.save();
    await task.populate('comments.user', 'name email avatar');
    await task.populate('assignee', 'name email avatar');
    await task.populate('reporter', 'name email avatar');
    await task.populate('project', 'name color');

    // Log activity
    await Activity.create({
      user: req.user._id,
      project: task.project,
      task: task._id,
      action: 'comment_added',
      details: `Commented on "${task.title}"`
    });

    res.json(task);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task order (for Kanban drag & drop)
// @route   PUT /api/tasks/:id/order
// @access  Private
const updateTaskOrder = async (req, res) => {
  try {
    const { status, order } = req.body;
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status, order },
      { new: true }
    )
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Update task order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Batch update task orders
// @route   PUT /api/tasks/batch/order
// @access  Private
const batchUpdateOrder = async (req, res) => {
  try {
    const { tasks } = req.body; // Array of { id, status, order }
    
    const bulkOps = tasks.map(t => ({
      updateOne: {
        filter: { _id: t.id },
        update: { status: t.status, order: t.order }
      }
    }));

    await Task.bulkWrite(bulkOps);
    res.json({ message: 'Order updated' });
  } catch (error) {
    console.error('Batch update order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  updateTaskOrder,
  batchUpdateOrder
};
