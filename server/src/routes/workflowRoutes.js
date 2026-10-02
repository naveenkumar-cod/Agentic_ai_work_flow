const express = require('express');
const { body } = require('express-validator');
const workflowController = require('../controllers/workflowController');
const { authMiddleware } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Apply auth middleware to all workflow routes
router.use(authMiddleware);

router.get('/dashboard', workflowController.getDashboard);

router.post(
  '/generate',
  [
    body('prompt')
      .trim()
      .notEmpty()
      .withMessage('Prompt cannot be empty'),
  ],
  validateRequest,
  workflowController.generateWorkflow
);

router.get('/', workflowController.listWorkflows);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Workflow name is required'),
  ],
  validateRequest,
  workflowController.createWorkflow
);

router.get('/:id', workflowController.getWorkflow);
router.put('/:id', workflowController.updateWorkflow);
router.post('/:id/duplicate', workflowController.duplicateWorkflow);
router.post('/:id/execute', workflowController.executeWorkflow);
router.delete('/:id', workflowController.deleteWorkflow);

module.exports = router;
