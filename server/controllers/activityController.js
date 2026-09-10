const Activity = require('../models/Activity');

// @desc    Get activity feed
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const activities = await Activity.find({})
      .populate('user', 'name email avatar')
      .populate('project', 'name color')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments({});

    res.json({
      activities,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get project activities
// @route   GET /api/activities/project/:id
// @access  Private
const getProjectActivities = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const activities = await Activity.find({ project: req.params.id })
      .populate('user', 'name email avatar')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(activities);
  } catch (error) {
    console.error('Get project activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getActivities, getProjectActivities };
