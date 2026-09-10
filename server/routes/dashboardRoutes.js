const express = require('express');
const { protect } = require('../middleware/auth');
const { getStats, getCharts } = require('../controllers/dashboardController');

const router = express.Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/charts', getCharts);

module.exports = router;
