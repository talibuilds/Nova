const express = require('express');
const { protect } = require('../middleware/auth');
const { getActivities, getProjectActivities } = require('../controllers/activityController');

const router = express.Router();

router.use(protect);

router.get('/', getActivities);
router.get('/project/:id', getProjectActivities);

module.exports = router;
