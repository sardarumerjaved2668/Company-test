const express = require('express');
const { body, param } = require('express-validator');
const {
  getAgents,
  getSuggestions,
  getWorkbenchToolbar,
  getMyAgentsPaginated,
  getMyWorkspace,
  createMyAgent,
  updateMyAgent,
  deleteMyAgent,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/agentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const createAgentRules = [
  body('name').trim().isLength({ min: 1, max: 80 }).withMessage('Name is required'),
  body('model').trim().isLength({ min: 1, max: 80 }).withMessage('Model is required'),
  body('templateId').optional().isString(),
  body('purpose').optional().isString(),
  body('systemPrompt').optional().isString(),
  body('tags').optional().isArray(),
  body('icon').optional().isString(),
];

const updateAgentRules = [
  param('id').isMongoId().withMessage('Invalid agent id'),
  body('name').optional().trim().isLength({ min: 1, max: 80 }),
  body('purpose').optional().isString(),
  body('systemPrompt').optional().isString(),
  body('model').optional().trim().isLength({ min: 1, max: 80 }),
  body('tags').optional().isArray(),
  body('icon').optional().isString(),
  body('isDefault').optional().isBoolean(),
];

const createTaskRules = [
  param('agentId').isMongoId().withMessage('Invalid agent id'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
];

const updateTaskRules = [
  param('taskId').isMongoId().withMessage('Invalid task id'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('done').optional().isBoolean(),
];

router.get('/suggestions', getSuggestions);
router.get('/workbench/toolbar', getWorkbenchToolbar);
router.get('/me/agents', protect, getMyAgentsPaginated);
router.get('/me', protect, getMyWorkspace);
router.post('/me', protect, createAgentRules, validate, createMyAgent);
router.patch('/me/:id', protect, updateAgentRules, validate, updateMyAgent);
router.delete('/me/:id', protect, [param('id').isMongoId().withMessage('Invalid agent id')], validate, deleteMyAgent);
router.post('/me/:agentId/tasks', protect, createTaskRules, validate, createTask);
router.patch('/tasks/:taskId', protect, updateTaskRules, validate, updateTask);
router.delete('/tasks/:taskId', protect, [param('taskId').isMongoId().withMessage('Invalid task id')], validate, deleteTask);

router.get('/', getAgents);

module.exports = router;
