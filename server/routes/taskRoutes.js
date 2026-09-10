const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  updateTaskOrder,
  batchUpdateOrder
} = require('../controllers/taskController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTasks)
  .post([
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('project').notEmpty().withMessage('Project is required'),
    validate
  ], createTask);

router.put('/batch/order', batchUpdateOrder);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

router.post('/:id/comments', [
  body('text').trim().notEmpty().withMessage('Comment text is required'),
  validate
], addComment);

router.put('/:id/order', updateTaskOrder);

module.exports = router;
