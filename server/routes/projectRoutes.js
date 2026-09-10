const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/projectController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post([
    body('name').trim().notEmpty().withMessage('Project name is required'),
    validate
  ], createProject);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

router.post('/:id/members', [
  body('userId').notEmpty().withMessage('User ID is required'),
  validate
], addMember);

router.delete('/:id/members/:userId', removeMember);

module.exports = router;
