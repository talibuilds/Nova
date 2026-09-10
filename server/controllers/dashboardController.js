const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    // Get user's projects
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    const projectIds = projects.map(p => p._id);

    // Get all tasks for user's projects
    const allTasks = await Task.find({ project: { $in: projectIds } });
    const myTasks = await Task.find({ 
      assignee: req.user._id,
      project: { $in: projectIds }
    });

    const totalProjects = projects.length;
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'done').length;
    const inProgressTasks = allTasks.filter(t => t.status === 'in-progress').length;
    const overdueTasks = allTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const activeProjects = projects.filter(p => p.status === 'active').length;
    const myTasksCount = myTasks.length;
    const myCompletedTasks = myTasks.filter(t => t.status === 'done').length;

    res.json({
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate,
      myTasksCount,
      myCompletedTasks
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get chart data
// @route   GET /api/dashboard/charts
// @access  Private
const getCharts = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    const projectIds = projects.map(p => p._id);
    const allTasks = await Task.find({ project: { $in: projectIds } });

    // Tasks by status
    const tasksByStatus = {
      todo: allTasks.filter(t => t.status === 'todo').length,
      'in-progress': allTasks.filter(t => t.status === 'in-progress').length,
      'in-review': allTasks.filter(t => t.status === 'in-review').length,
      done: allTasks.filter(t => t.status === 'done').length
    };

    // Tasks by priority
    const tasksByPriority = {
      low: allTasks.filter(t => t.priority === 'low').length,
      medium: allTasks.filter(t => t.priority === 'medium').length,
      high: allTasks.filter(t => t.priority === 'high').length,
      urgent: allTasks.filter(t => t.priority === 'urgent').length
    };

    // Projects by status
    const projectsByStatus = {
      planning: projects.filter(p => p.status === 'planning').length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      'on-hold': projects.filter(p => p.status === 'on-hold').length
    };

    // Weekly progress (last 7 days)
    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const created = allTasks.filter(t => {
        const d = new Date(t.createdAt);
        return d >= date && d < nextDate;
      }).length;

      const completed = allTasks.filter(t => {
        if (!t.completedAt) return false;
        const d = new Date(t.completedAt);
        return d >= date && d < nextDate;
      }).length;

      weeklyProgress.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        created,
        completed
      });
    }

    res.json({
      tasksByStatus,
      tasksByPriority,
      projectsByStatus,
      weeklyProgress
    });
  } catch (error) {
    console.error('Get charts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStats, getCharts };
